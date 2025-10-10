import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest'
import db from '../../../src/ports/knex.client'
import { KnexRiderRepository } from '../../../src/ports/knex-rider.repository'

const describeIf = process.env.INTEGRATION === '1' ? describe : describe.skip

describeIf('KnexRiderRepository integration (DB)', () => {
  let trx: any

  beforeAll(async () => {
    if (!(await db.schema.hasTable('riders'))) {
      await db.schema.createTable('riders', (t) => {
        t.string('id').primary()
        t.integer('balance')
        t.date('birthday')
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

  test('insert -> select -> update -> delete for rider and maps fields', async () => {
    const riderRepo = new KnexRiderRepository(trx as any)

    // CREATE via repo
    await riderRepo.save({ id: 'r_repo_1', balance: 123, booking: [], birthday: new Date('1995-05-05') })

    // READ via repo
    const r = await riderRepo.findById('r_repo_1')
    expect(r).not.toBeNull()
    expect(r!.id).toBe('r_repo_1')
    expect(r!.balance).toBe(123)
    expect(r!.birthday.getFullYear()).toBe(1995)

    // UPDATE
    r!.balance = 200
    await riderRepo.save(r!)
    const raw = await trx('riders').where({ id: 'r_repo_1' }).first()
    expect(Number(raw.balance)).toBe(200)

    // clean up
    await trx('riders').where({ id: 'r_repo_1' }).del()
    const after = await riderRepo.findById('r_repo_1')
    expect(after).toBeNull()
  })
})
