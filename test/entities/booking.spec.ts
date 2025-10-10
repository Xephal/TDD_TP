import { describe, it, expect } from 'vitest'
import { Booking, BookingStatus } from '../../src/entities/booking'

describe('Booking entity', () => {
  it('defaults status to PENDING when not provided', () => {
    const b = new Booking('id1', 'r1', 'A', 'B', undefined as any, 10)
    expect(b.status).toBe(BookingStatus.PENDING)
  })

  it('throws when amount <= 0', () => {
    expect(() => new Booking('id2', 'r1', 'A', 'B', BookingStatus.PENDING, 0)).toThrow('Booking.amount must be positive')
    expect(() => new Booking('id3', 'r1', 'A', 'B', BookingStatus.PENDING, -5)).toThrow('Booking.amount must be positive')
  })

  it('throws when from === to', () => {
    expect(() => new Booking('id4', 'r1', 'A', 'A', BookingStatus.PENDING, 10)).toThrow('Booking.from and to must differ')
  })

  it('keeps createdAt if provided', () => {
    const t = 555
    const b = new Booking('id5', 'r1', 'A', 'B', BookingStatus.PENDING, 10, t)
    expect(b.createdAt).toBe(t)
  })
})
