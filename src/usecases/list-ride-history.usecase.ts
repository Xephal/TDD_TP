import type { Booking } from "../entities/booking"
import type { BookingRepository } from "../domain/repositories/booking.repository"
import type { DriverRepository } from "../domain/repositories/driver.repository"

type RideHistoryItem = Booking & { driverName?: string | null }

export function createListRideHistoryUseCase(
  bookingRepo: BookingRepository,
  driverRepo?: DriverRepository
) {
  return async (riderId: string): Promise<RideHistoryItem[]> => {
    const bookings = await bookingRepo.findByRiderId(riderId)

    if (!driverRepo) return bookings

    const withNames = await Promise.all(
      bookings.map(async (b) => {
        if (!b.driverId) return b
        const driver = await driverRepo.findById(b.driverId)
        return { ...b, driverName: driver?.name ?? null }
      })
    )
    return withNames
  }
}
