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
    // ensure a deterministic order: most recent first
    const sorted = bookings.slice().sort((a, b) => {
      const ta = a.createdAt ?? 0
      const tb = b.createdAt ?? 0
      return tb - ta
    })

    if (!driverRepo) {
      // attach driverName as null when driverRepo is absent (type-safe)
      return sorted.map(b => ({ ...b, driverName: null }))
    }

    const withNames = await Promise.all(
      sorted.map(async (b) => {
  if (!b.driverId) return { ...b, driverName: null }
        const driver = await driverRepo.findById(b.driverId)
        return { ...b, driverName: driver?.name ?? null }
      })
    )

    return withNames
  }
}
