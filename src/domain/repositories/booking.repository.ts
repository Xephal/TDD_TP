import type { Booking } from "../../entities/booking"

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>
  findByRiderId(riderId: string): Promise<Booking[]>
  save(booking: Booking): Promise<void>
}