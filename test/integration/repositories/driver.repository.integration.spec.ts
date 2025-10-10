import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest'
import db from '../../../src/ports/knex.client'
import { KnexDriverRepository } from '../../../src/ports/knex-driver.repository'
import { KnexBookingRepository } from '../../../src/ports/knex-booking.repository'
import { BookingStatus } from '../../../src/entities/booking'

const describeIf = process.env.INTEGRATION === '1' ? describe : describe.skip

describeIf('KnexDriverRepository integration (DB)', () => {
  let trx: any

  beforeAll(async () => {
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

  test('insert booking and read latest booking on driver', async () => {
    await trx('drivers').insert({ id: 'dr_repo_1', name: 'D Repo' })
    await trx('riders').insert({ id: 'r_rider_1', balance: 0, birthday: '1990-01-01' }).catch(() => {})

    const now = new Date()
    const older = new Date(now.getTime() - 1000)
    const newer = now

    // two bookings for driver dr_repo_1
  await trx('bookings').insert({ id: 'bk1', rider_id: 'r_rider_1', driver_id: 'dr_repo_1', from: 'X', to: 'Y', status: BookingStatus.PENDING, amount: 5, distance_km: 1, created_at: older })
  await trx('bookings').insert({ id: 'bk2', rider_id: 'r_rider_1', driver_id: 'dr_repo_1', from: 'X', to: 'Z', status: BookingStatus.ACCEPTED, amount: 15, distance_km: 2, created_at: newer })

    const driverRepo = new KnexDriverRepository(trx as any)

    const driver = await driverRepo.findById('dr_repo_1')
    expect(driver).not.toBeNull()
    // latest booking should be bk2 due to created_at desc
    expect(driver!.booking).not.toBeNull()
    expect(driver!.booking!.id).toBe('bk2')
  })
})
