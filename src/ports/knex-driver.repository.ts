import type { Driver } from "../entities/driver"
import { Booking, BookingStatus } from "../entities/booking"
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
        ? new Booking(
            bookingRow.id,
            bookingRow.rider_id,
            bookingRow.from,
            bookingRow.to,
            bookingRow.status as BookingStatus,
            Number(bookingRow.amount),
            Number(bookingRow.created_at),
            bookingRow.driver_id ?? null,
            bookingRow.distance_km ?? null
          )
        : null,
    }

    return driver
  }

  async save(driver: Driver): Promise<void> {
    await this.knex("drivers").insert({ id: driver.id, name: null }).onConflict("id").merge()
  }
}
