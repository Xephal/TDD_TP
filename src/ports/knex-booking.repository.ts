import { Booking } from "../entities/booking"
import type { BookingRepository } from "../domain/repositories/booking.repository"
import db from "./knex.client"
import type { Knex } from "knex"

export class KnexBookingRepository implements BookingRepository {
  private knex: Knex

  constructor(knexInstance?: Knex) {
    this.knex = knexInstance ?? db
  }

  async findById(id: string): Promise<Booking | null> {
    const row = await this.knex("bookings").where({ id }).first()
    if (!row) return null

    return new Booking(
      row.id,
      row.rider_id,
      row.from,
      row.to,
      row.status,
      Number(row.amount),
      // DB stores created_at as seconds (or timestamp) -> convert to ms for domain
      typeof row.created_at === 'number' ? Number(row.created_at) * 1000 : new Date(row.created_at).getTime(),
      row.driver_id ?? null,
      row.distance_km ?? null
    )
  }

  async findByRiderId(riderId: string): Promise<Booking[]> {
    const rows = await this.knex("bookings").where({ rider_id: riderId }).orderBy("created_at", "desc")
    return rows.map((row: any) => new Booking(
      row.id,
      row.rider_id,
      row.from,
      row.to,
      row.status,
      Number(row.amount),
      typeof row.created_at === 'number' ? Number(row.created_at) * 1000 : new Date(row.created_at).getTime(),
      row.driver_id ?? null,
      row.distance_km ?? null
    ))
  }

  async save(booking: Booking): Promise<void> {
    const createdAtMs = booking.createdAt ?? Date.now()
    const payload: any = {
      id: booking.id,
      rider_id: booking.riderId,
      driver_id: booking.driverId ?? null,
      from: booking.from,
      to: booking.to,
      status: booking.status,
      amount: booking.amount,
      distance_km: booking.distanceKm ?? null,
      // Send a JS Date so pg/knex serializes it correctly to timestamp with time zone
      created_at: new Date(createdAtMs),
    }

    await this.knex("bookings").insert(payload).onConflict("id").merge()
  }
}
