import type { Driver } from "../entities/driver"
import type { DriverRepository } from "../domain/repositories/driver.repository"
import db from "./knex.client"
import type { Knex } from "knex"

export class KnexDriverRepository implements DriverRepository {
  private knex: Knex

  constructor(knexInstance?: Knex) {
    this.knex = knexInstance ?? db
  }

  async findById(id: string): Promise<Driver | null> {
    const row = await this.knex("drivers").where({ id }).first()
    if (!row) return null

  const bookingRow = await this.knex("bookings").where({ driver_id: id }).orderBy("created_at", "desc").first()

    const driver: Driver = {
      id: row.id,
      name: row.name ?? null,
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
    await this.knex("drivers").insert({ id: driver.id, name: null }).onConflict("id").merge()
  }
}
