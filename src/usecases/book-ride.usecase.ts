import { calculateTotalPrice } from "../domain/services/pricing.service"
import { canBook, canBookNewRide } from "../domain/services/rider.service"
import { BookingStatus, type Booking } from "../entities/booking"
import type { Rider } from "../entities/rider"

export function bookRide(rider: Rider, from: string, to: string, distanceKm: number): Booking {
  const total = calculateTotalPrice(from, to, distanceKm)

  if (!canBook(rider.balance, total)) throw new Error("Insufficient funds")
  if (!canBookNewRide(rider.booking)) throw new Error("Existing booking")

  const booking: Booking = {
    id: crypto.randomUUID(),
    riderId: rider.id,
    from,
    to,
    status: BookingStatus.PENDING,
    amount: total,
    distanceKm
  }

  rider.booking = booking
  rider.balance -= total

  return booking
}

export function cancelBooking(rider: Rider): Booking {
  if (rider.booking === null) throw new Error("No active booking to cancel")

  const canceled = { ...rider.booking, status: BookingStatus.CANCELED }
  rider.booking = null
  return canceled
}
