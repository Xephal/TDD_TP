import { describe, it, expect } from 'vitest'
import { BookingRepositoryFake } from './booking.repository.fake'
import { Booking, BookingStatus } from '../../src/entities/booking'

describe('BookingRepositoryFake ordering', () => {
  it('returns bookings sorted by createdAt desc', async () => {
    const repo = new BookingRepositoryFake([
      new Booking('b1','r1','A','B',BookingStatus.ACCEPTED,10,1000),
      new Booking('b2','r1','A','B',BookingStatus.ACCEPTED,10,2000)
    ])

    const res = await repo.findByRiderId('r1')
    expect(res.map((b: Booking) => b.id)).toEqual(['b2','b1'])
  })
})
