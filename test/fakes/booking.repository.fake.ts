import type { Booking } from "../../src/entities/booking"
import type { BookingRepository } from "../../src/domain/repositories/booking.repository"

export class BookingRepositoryFake implements BookingRepository {
  private bookings = new Map<string, Booking>()

  constructor(bookings?: Booking[]) {
    bookings?.forEach(b => this.bookings.set(b.id, b))
  }

  async findById(id: string): Promise<Booking | null> {
    return this.bookings.get(id) ?? null
  }

  async findByRiderId(riderId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(b => b.riderId === riderId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  async save(booking: Booking): Promise<void> {
    const existing = this.bookings.get(booking.id)
    if (existing) {
      // merge while preserving existing.createdAt unless explicitly provided
      const merged: Booking = { ...existing, ...booking }
      if (booking.createdAt == null) merged.createdAt = existing.createdAt
      this.bookings.set(booking.id, merged)
    } else {
      // ensure createdAt exists on first save
      if (booking.createdAt == null) booking.createdAt = Date.now()
      this.bookings.set(booking.id, booking)
    }
  }
}