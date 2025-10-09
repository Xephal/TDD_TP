import { calculateTotalPrice } from "../domain/services/pricing.service"
import { checkBalance, canBookRide } from "../domain/services/rider.service"
import { BookingStatus, type Booking } from "../entities/booking"
import type { Rider } from "../entities/rider"
import type { RiderRepository } from "../domain/repositories/rider.repository"
import type { BookingRepository } from "../domain/repositories/booking.repository"
import type { DriverRepository } from "../domain/repositories/driver.repository"


export function createBookRideUseCase(
  riderRepo: RiderRepository,
  bookingRepo: BookingRepository,
  driverRepo: DriverRepository
) {
  return async (rider: Rider, from: string, to: string, distanceKm: number): Promise<Booking> => {
    const total = calculateTotalPrice(from, to, distanceKm)
    const booking: Booking = {
      id: `b_${Math.random().toString(36).substring(2, 9)}`,
      riderId: rider.id,
      from,
      to,
      status: BookingStatus.PENDING,
      amount: total,
      distanceKm,
    }

    if (!checkBalance(rider.balance, total)) throw new Error("Insufficient funds")
    if (!canBookRide(rider, booking)) throw new Error("Existing booking")

    rider.balance -= total
    rider.booking.push(booking)

    await bookingRepo.save(booking)
    await riderRepo.findById(rider.id)

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
    await riderRepo.findById(rider.id)

    return booking
  }
}
