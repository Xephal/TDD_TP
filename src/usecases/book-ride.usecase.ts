import { calculateTotalPrice } from "../domain/services/pricing.service"
import { checkBalance, canBookRide } from "../domain/services/rider.service"
import { BookingStatus, type Booking } from "../entities/booking"
import type { Rider } from "../entities/rider"
import type { RiderRepository } from "../domain/repositories/rider.repository"
import type { BookingRepository } from "../domain/repositories/booking.repository"
import type { DriverRepository } from "../domain/repositories/driver.repository"
import type { Calendar } from "../domain/interfaces/calendar.service"
import type { DistanceCalculator } from "../domain/interfaces/distance-calculator.interface"

export function createBookRideUseCase(
  riderRepo: RiderRepository,
  bookingRepo: BookingRepository,
  driverRepo: DriverRepository,
  calendar: Calendar,
  distanceCalculator: DistanceCalculator 
) {
  return async (rider: Rider, from: string, to: string, _distanceKm?: number, uberx?: boolean): Promise<Booking> => {
    const distanceKm = _distanceKm ?? await distanceCalculator.getDistanceKm(from, to);
    const basePrice = calculateTotalPrice(from, to, distanceKm)
    const today = calendar.today() 

    const isChristmas = today.getMonth() === 11 && today.getDate() === 25
    let total = isChristmas ? basePrice * 2 : basePrice

    if (!checkBalance(rider.balance, total)) throw new Error("Insufficient funds")

    const booking: Booking = {
      id: `b_${Math.random().toString(36).substring(2, 9)}`,
      riderId: rider.id,
      from,
      to,
      status: BookingStatus.PENDING,
      amount: total,
      distanceKm,
      createdAt: Date.now(),
      driverId: null,
    }

    if (!canBookRide(rider, booking)) throw new Error("Existing booking")

    const isBirthday =
      today.getDate() === rider.birthday.getDate() &&
      today.getMonth() === rider.birthday.getMonth()

    if (!isBirthday && uberx) {
      booking.amount += 5
      total = booking.amount
    }

    rider.balance -= total
  // ensure booking array exists
  rider.booking = rider.booking ?? []
  rider.booking.push(booking)

    await bookingRepo.save(booking)
    await riderRepo.save(rider)

    return booking
  }
}

export function createCancelBookingUseCase(
  riderRepo: RiderRepository,
  bookingRepo: BookingRepository
) {
  return async (rider: Rider): Promise<Booking> => {
    const booking = rider.booking.find(
      b => b.status === BookingStatus.PENDING || b.status === BookingStatus.ACCEPTED
    )
    if (!booking) throw new Error("No booking to cancel")

    const today = new Date()
    const isBirthday =
      today.getDate() === rider.birthday.getDate() &&
      today.getMonth() === rider.birthday.getMonth()

    if (booking.status === BookingStatus.ACCEPTED) {
      rider.balance += isBirthday ? booking.amount : booking.amount - 5
    } else if (booking.status === BookingStatus.PENDING) {
      rider.balance += booking.amount
    }

    booking.status = BookingStatus.CANCELED
    await bookingRepo.save(booking)
    await riderRepo.save(rider)

    return booking
  }
}
