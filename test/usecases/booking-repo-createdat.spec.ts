import { describe, it, expect } from 'vitest'
import { BookingRepositoryFake } from '../../test/fakes/booking.repository.fake'
import { Booking, BookingStatus } from '../../src/entities/booking'

describe('BookingRepositoryFake', () => {
  it('sets createdAt when saving a booking without createdAt', async () => {
    // arrange
    const repo = new BookingRepositoryFake()
    const booking = new Booking('x1', 'r1', 'A', 'B', BookingStatus.PENDING, 5)

    // act
    await repo.save(booking)
    const stored = await repo.findById('x1')

    // assert: createdAt should be set and be a number
    expect(stored).not.toBeNull()
    expect(stored).toMatchObject({ id: 'x1', createdAt: expect.any(Number) })
    expect(stored!.createdAt).toBeGreaterThan(0)
  })

  it('does not override existing createdAt', async () => {
    // arrange
    const repo = new BookingRepositoryFake()
    const customTime = 123456
    const booking = new Booking('x2', 'r2', 'A', 'B', BookingStatus.PENDING, 5, customTime)

    // act
    await repo.save(booking)
    const stored = await repo.findById('x2')

    // assert
    expect(stored).not.toBeNull()
    expect(stored!.createdAt).toBe(customTime)
  })

  it('findByRiderId returns bookings sorted by createdAt descending', async () => {
    // arrange
    const repo = new BookingRepositoryFake()
    const b1 = new Booking('b1', 'r1', 'A', 'B', BookingStatus.PENDING, 5, 1000)
    const b2 = new Booking('b2', 'r1', 'A', 'C', BookingStatus.PENDING, 6, 2000)
    const b3 = new Booking('b3', 'r2', 'A', 'D', BookingStatus.PENDING, 7, 3000)

    // act
    await repo.save(b1)
    await repo.save(b2)
    await repo.save(b3)
    const rides = await repo.findByRiderId('r1')

    // assert: newest first
    expect(rides.map(r => r.id)).toEqual(['b2', 'b1'])
  })
})
