import { describe, test, expect, beforeEach, afterEach } from "vitest"
import db from "../../src/ports/knex.client"
import { KnexBookingRepository } from "../../src/ports/knex-booking.repository"
import { KnexDriverRepository } from "../../src/ports/knex-driver.repository"
import { KnexRiderRepository } from "../../src/ports/knex-rider.repository"
import { createListRideHistoryUseCase } from "../../src/usecases/list-ride-history.usecase"
import { CalendarStub } from "./../stubs/calendar.stub"

describe.skipIf(process.env.INTEGRATION !== "1")("List ride history integration (DB)", () => {
  let trx: any
  let bookingRepo: KnexBookingRepository
  let driverRepo: KnexDriverRepository
  let riderRepo: KnexRiderRepository
  let listHistory: ReturnType<typeof createListRideHistoryUseCase>

  beforeEach(async () => {
    trx = await db.transaction()
    bookingRepo = new KnexBookingRepository(trx)
    driverRepo = new KnexDriverRepository(trx)
    riderRepo = new KnexRiderRepository(trx)

    await trx("riders").insert({ id: "ri_1", balance: 0, birthday: "1990-01-01" })
    await trx("drivers").insert({ id: "d_1", name: "Integration Driver" })

  const now = new Date()
  const older = new Date(now.getTime() - 1000)
  const newer = now

  await trx("bookings").insert({ id: "b1", rider_id: "ri_1", driver_id: "d_1", from: "Paris", to: "Lyon", status: "accepted", amount: 20, distance_km: 10, created_at: older })
  await trx("bookings").insert({ id: "b2", rider_id: "ri_1", driver_id: null, from: "Paris", to: "Other", status: "canceled", amount: 5, created_at: newer })

    listHistory = createListRideHistoryUseCase(bookingRepo, driverRepo)
  })

  afterEach(async () => {
    if (trx) {
      await trx.rollback()
      trx = null
    }
  })

  test("returns rides ordered and includes driver name when present", async () => {
    const res = await listHistory("ri_1")
    expect(res).toHaveLength(2)
    expect(res.map(r => r.id)).toEqual(["b2", "b1"]) 
    expect((res[1] as any).driverName).toBe("Integration Driver")
  })
})
