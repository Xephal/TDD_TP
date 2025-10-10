import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest'
import db from '../../../src/ports/knex.client'
import { KnexBookingRepository } from '../../../src/ports/knex-booking.repository'
import { BookingStatus } from '../../../src/entities/booking'

const describeIf = process.env.INTEGRATION === '1' ? describe : describe.skip

describeIf('KnexBookingRepository integration (DB)', () => {
  let trx: any

  beforeAll(async () => {
    // ensure tables exist (migrations may already have run)
    if (!(await db.schema.hasTable('riders'))) {
      await db.schema.createTable('riders', (t) => {
        t.string('id').primary()
        t.integer('balance')
        t.date('birthday')
      })
    }
    if (!(await db.schema.hasTable('drivers'))) {
      await db.schema.createTable('drivers', (t) => {
        t.string('id').primary()
        t.string('name')
      })
    }
    if (!(await db.schema.hasTable('bookings'))) {
      await db.schema.createTable('bookings', (t) => {
        t.string('id').primary()
        t.string('rider_id')
        t.string('driver_id')
        t.string('from')
        t.string('to')
        t.string('status')
        t.decimal('amount', 10, 2)
        t.integer('distance_km')
        t.timestamp('created_at')
      })
    }
  })

  beforeEach(async () => {
    trx = await db.transaction()
  })

  afterEach(async () => {
    if (trx) {
      await trx.rollback()
      trx = null
    }
  })

  afterAll(async () => {
    await db.destroy()
  })

  test('insert -> select -> update -> delete and maps snake_case to camelCase', async () => {
    // insert a rider and a booking row using raw trx
    await trx('riders').insert({ id: 'ri_repo_1', balance: 50, birthday: '1990-01-01' })

    const created = new Date()
    const older = new Date(created.getTime() - 1000)

    await trx('bookings').insert({
      id: 'br_1',
      rider_id: 'ri_repo_1',
      driver_id: null,
      from: 'A',
      to: 'B',
      status: 'pending',
      amount: 10,
      distance_km: 3,
      created_at: older,
    })

    const bookingRepo = new KnexBookingRepository(trx as any)

    // SELECT (read mapping to domain)
    const found = await bookingRepo.findById('br_1')
    expect(found).not.toBeNull()
    expect(found!.id).toBe('br_1')
    expect(found!.riderId).toBe('ri_repo_1')
    expect(found!.distanceKm).toBe(3)
    // createdAt should be in ms and close to inserted date
    expect(Math.abs(found!.createdAt - older.getTime())).toBeLessThan(2000)

  // UPDATE: change status and driver_id via repository save
  // ensure driver exists for FK
  await trx('drivers').insert({ id: 'd_repo_1', name: 'Driver Repo' })
  found!.status = BookingStatus.ACCEPTED
  found!.driverId = 'd_repo_1'
  await bookingRepo.save(found!)

    // verify DB row updated
    const raw = await trx('bookings').where({ id: 'br_1' }).first()
    expect(raw.status).toBe('accepted')
    expect(raw.driver_id).toBe('d_repo_1')

    // DELETE: remove row
    await trx('bookings').where({ id: 'br_1' }).del()
    const after = await bookingRepo.findById('br_1')
    expect(after).toBeNull()
  })
})
