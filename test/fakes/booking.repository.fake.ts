import type { Booking } from "../../src/entities/booking"
import type { BookingRepository } from "../../src/domain/repositories/booking.repository"

export class BookingRepositoryFake implements BookingRepository {
  private bookings = new Map<string, Booking>()

  constructor(bookings?: Booking[]) {
    bookings?.forEach(b => this.bookings.set(b.id, b))
  }

  findById(id: string): Booking | null {
    return this.bookings.get(id) ?? null
  }

  findByRiderId(riderId: string): Booking[] {
    return Array.from(this.bookings.values()).filter(b => b.riderId === riderId)
  }

  save(booking: Booking): void {
    this.bookings.set(booking.id, booking)
  }
}