import type { Booking } from "../../entities/booking"

export interface BookingRepository {
  findById(id: string): Booking | null
  findByRiderId(riderId: string): Booking[]
  save(booking: Booking): void
}