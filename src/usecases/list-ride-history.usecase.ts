import type { BookingRepository } from "../domain/repositories/booking.repository"
import type { DriverRepository } from "../domain/repositories/driver.repository"

export interface RideHistoryItem {
  readonly id: string
  readonly riderId: string
  readonly driverId: string | null
  readonly from: string
  readonly to: string
  readonly status: string
  readonly amount: number
  readonly distanceKm: number | null
  readonly createdAt: number
  readonly driverName: string | null
}

/**
 * Use case: lists all bookings for a rider, ordered by recency,
 * optionally enriched with driver names when a driver repository is provided.
 */
export function createListRideHistoryUseCase(
  bookingRepo: BookingRepository,
  driverRepo?: DriverRepository
) {
  return async (riderId: string): Promise<RideHistoryItem[]> => {
    // Fetch bookings (the repo should already return them in order)
    const bookings = await bookingRepo.findByRiderId(riderId)

    if (bookings.length === 0) return []

    // Prepare a cache to avoid repeated lookups if several rides share the same driver
    const driverCache = new Map<string, string | null>()

    const resolveDriverName = async (driverId: string | null): Promise<string | null> => {
      if (!driverRepo || !driverId) return null
      if (driverCache.has(driverId)) return driverCache.get(driverId)!
      const driver = await driverRepo.findById(driverId)
      const name = driver?.name ?? null
      driverCache.set(driverId, name)
      return name
    }

    // Map each booking into an enriched output DTO (pure, immutable)
    const results = await Promise.all(
      bookings.map(async (b) => ({
        id: b.id,
        riderId: b.riderId,
        driverId: b.driverId,
        from: b.from,
        to: b.to,
        status: b.status,
        amount: b.amount,
        distanceKm: b.distanceKm,
        createdAt: b.createdAt,
        driverName: await resolveDriverName(b.driverId)
      }))
    )

    // Always return newest first, in case the repo doesn’t guarantee it
    results.sort((a, b) => b.createdAt - a.createdAt)

    return results
  }
}
