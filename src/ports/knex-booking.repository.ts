import type { Booking } from "../entities/booking"
import type { BookingRepository } from "../domain/repositories/booking.repository"
import db from "./knex.client"

export class KnexBookingRepository implements BookingRepository {
  async findById(id: string): Promise<Booking | null> {
    const row = await db("bookings").where({ id }).first()
    if (!row) return null

    return {
      id: row.id,
      riderId: row.rider_id,
      driverId: row.driver_id,
      from: row.from,
      to: row.to,
      status: row.status,
      amount: Number(row.amount),
      distanceKm: row.distance_km,
    }
  }

  async findByRiderId(riderId: string): Promise<Booking[]> {
    const rows = await db("bookings").where({ rider_id: riderId }).orderBy("created_at", "desc")
    return rows.map((row: any) => ({
      id: row.id,
      riderId: row.rider_id,
      driverId: row.driver_id,
      from: row.from,
      to: row.to,
      status: row.status,
      amount: Number(row.amount),
      distanceKm: row.distance_km,
    }))
  }

  async save(booking: Booking): Promise<void> {
    const payload: any = {
      id: booking.id,
      rider_id: booking.riderId,
      driver_id: booking.driverId || null,
      from: booking.from,
      to: booking.to,
      status: booking.status,
      amount: booking.amount,
      distance_km: booking.distanceKm || null,
    }

    await db("bookings").insert(payload).onConflict("id").merge()
  }
}
