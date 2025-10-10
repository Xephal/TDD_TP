import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest'
import knex from 'knex'
import { KnexBookingRepository } from '../../../src/ports/knex-booking.repository'
import { KnexDriverRepository } from '../../../src/ports/knex-driver.repository'
import { createListRideHistoryUseCase } from '../../../src/usecases/list-ride-history.usecase'

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL ?? {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'test_db',
    port: 5432,
  },
})

const describeIf = process.env.INTEGRATION === '1' ? describe : describe.skip

describeIf('List ride history integration (DB)', () => {
  beforeAll(async () => {
    // Create minimal schema if not exists
    const hasDrivers = await db.schema.hasTable('drivers')
    if (!hasDrivers) {
      await db.schema.createTable('drivers', (t) => {
        t.string('id').primary()
        t.string('name')
      })
    }

    const hasBookings = await db.schema.hasTable('bookings')
    if (!hasBookings) {
      await db.schema.createTable('bookings', (t) => {
        t.string('id').primary()
        t.string('rider_id')
        t.string('driver_id')
        t.string('from')
        t.string('to')
        t.string('status')
        t.integer('amount')
        t.integer('distance_km')
        t.timestamp('created_at')
      })
    }
    const hasRiders = await db.schema.hasTable('riders')
    if (!hasRiders) {
      await db.schema.createTable('riders', (t) => {
        t.string('id').primary()
        t.integer('balance')
        t.date('birthday')
      })
    }
  })

  let trx: any

  beforeEach(async () => {
    // use a transaction per test to avoid global table locks and TRUNCATE deadlocks
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

  test('returns rides ordered and includes driver name when present', async () => {
    // arrange: insert drivers and bookings inside transaction
    await trx('riders').insert({ id: 'ri_1', balance: 0, birthday: '1990-01-01' }).catch(() => {})
    await trx('drivers').insert({ id: 'd_1', name: 'Jean' })

    const now = new Date()
    const older = new Date(now.getTime() - 1000)
    const newer = now

    await trx('bookings').insert({ id: 'b1', rider_id: 'ri_1', driver_id: 'd_1', from: 'Paris', to: 'Lyon', status: 'accepted', amount: 20, distance_km: 10, created_at: older })
    await trx('bookings').insert({ id: 'b2', rider_id: 'ri_1', driver_id: null, from: 'Paris', to: 'Other', status: 'canceled', amount: 5, created_at: newer })

    const bookingRepo = new KnexBookingRepository(trx as any)
    const driverRepo = new KnexDriverRepository(trx as any)
    const listHistory = createListRideHistoryUseCase(bookingRepo, driverRepo)

    const res = await listHistory('ri_1')

    expect(res).toHaveLength(2)
    expect(res.map(r => r.id)).toEqual(['b2', 'b1'])
    expect(res[0].driverName).toBeNull()
    expect((res[1] as any).driverName).toBe('Jean')
  })
})
