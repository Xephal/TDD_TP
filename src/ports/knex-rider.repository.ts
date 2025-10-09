import type { Rider } from "../entities/rider"
import type { RiderRepository } from "../domain/repositories/rider.repository"
import db from "./knex.client"
import type { Knex } from "knex"
import type { Booking } from "../entities/booking"

export class KnexRiderRepository implements RiderRepository {
  private knex: Knex

  constructor(knexInstance?: Knex) {
    this.knex = knexInstance ?? db
  }

  async findById(id: string): Promise<Rider | null> {
    const row = await this.knex("riders").where({ id }).first()
    if (!row) return null

  const bookingsRows = await this.knex("bookings").where({ rider_id: id })
    const bookings: Booking[] = bookingsRows.map((b: any) => ({
      id: b.id,
      riderId: b.rider_id,
      driverId: b.driver_id,
      from: b.from,
      to: b.to,
      status: b.status,
      amount: Number(b.amount),
      distanceKm: b.distance_km,
    }))

    const rider: Rider = {
      id: row.id,
      balance: Number(row.balance),
      booking: bookings,
      birthday: row.birthday ? new Date(row.birthday) : new Date(0),
    }

    return rider
  }

  async save(rider: Rider): Promise<void> {
    await this.knex("riders").insert({ id: rider.id, balance: rider.balance, birthday: rider.birthday }).onConflict("id").merge()
  }
}
