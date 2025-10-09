import type { Booking } from "../entities/booking"
import type { BookingRepository } from "../domain/repositories/booking.repository"

export function createListRideHistoryUseCase(bookingRepo: BookingRepository) {
  return async (riderId: string): Promise<Booking[]> => {
    const bookings = await bookingRepo.findByRiderId(riderId)
    return bookings
  }
}
