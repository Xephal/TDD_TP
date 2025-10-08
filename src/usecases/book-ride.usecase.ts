import { calculateTotalPrice } from "../domain/services/pricing.service"
import { canBook, canBookNewRide } from "../domain/services/rider.service"
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

  if (!canBook(rider.balance, total)) throw new Error("Insufficient funds")
  if (!canBookNewRide(rider.booking)) throw new Error("Existing booking")

  const booking: Booking = {
    id: crypto.randomUUID(),
    riderId: rider.id,
    from,
    to,
    status: BookingStatus.PENDING,
    amount: total,
    distanceKm,
  }

  rider.booking = booking
  rider.balance -= total

  //repository.save(rider) // ← le monde persistant reflète le nouveau rider
  return booking
}

export function cancelBooking(rider: Rider, repository: RiderRepository): Booking {
  if (rider.booking === null) throw new Error("No active booking to cancel")

  const canceled = { ...rider.booking, status: BookingStatus.CANCELED }
  rider.booking = null

  //repository.save(rider)
  return canceled
}
