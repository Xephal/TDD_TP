import { calculateTotalPrice } from "../domain/services/pricing.service"
import { checkBalance, canBookRide } from "../domain/services/rider.service"
import { BookingStatus, type Booking } from "../entities/booking"
import type { Rider } from "../entities/rider"
import type { RiderRepository } from "../domain/repositories/rider.repository"

export function bookRide(
  rider: Rider,
  from: string,
  to: string,
  distanceKm: number,
  repository: RiderRepository
): Booking {
  const total = calculateTotalPrice(from, to, distanceKm)
  const newBooking: Booking = {
    id: `b_${Math.random().toString(36).substring(2, 9)}`,
    riderId: rider.id,
    from,
    to,
    status: BookingStatus.PENDING,
    amount: total,
    distanceKm,
  }

  if (!checkBalance(rider.balance, total)) throw new Error("Insufficient funds")
  if (!canBookRide(rider, newBooking)) throw new Error("Existing booking")

  

  rider.booking.push(newBooking)
  rider.balance -= total

  return newBooking
}

export function cancelBooking(rider: Rider, repository: RiderRepository): Booking {
  const booking = rider.booking.find(b => b.status === BookingStatus.PENDING || b.status === BookingStatus.ACCEPTED)
  if (!booking) throw new Error("No booking to cancel")
  if (booking.status === BookingStatus.ACCEPTED) {
    if (new Date().getDate() === rider.birthday.getDate() && new Date().getMonth() === rider.birthday.getMonth()){
      rider.balance += booking.amount
    } else {
    rider.balance += booking.amount - 5 
    }
  }
  if (booking.status === BookingStatus.PENDING) rider.balance += booking.amount
  booking.status = BookingStatus.CANCELED
  return booking
}
