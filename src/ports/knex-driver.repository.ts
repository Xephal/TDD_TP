import type { Driver } from "../entities/driver"
import type { DriverRepository } from "../domain/repositories/driver.repository"
import db from "./knex.client"

export class KnexDriverRepository implements DriverRepository {
  async findById(id: string): Promise<Driver | null> {
    const row = await db("drivers").where({ id }).first()
    if (!row) return null

    const bookingRow = await db("bookings").where({ driver_id: id }).orderBy("created_at", "desc").first()

    const driver: Driver = {
      id: row.id,
      booking: bookingRow
        ? {
            id: bookingRow.id,
            riderId: bookingRow.rider_id,
            driverId: bookingRow.driver_id,
            from: bookingRow.from,
            to: bookingRow.to,
            status: bookingRow.status,
            amount: Number(bookingRow.amount),
            distanceKm: bookingRow.distance_km,
          }
        : null,
    }

    return driver
  }

  async save(driver: Driver): Promise<void> {
    await db("drivers").insert({ id: driver.id, name: null }).onConflict("id").merge()
  }
}
