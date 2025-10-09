import { describe, test, expect, beforeAll, afterAll } from "vitest"
import db from "../../src/ports/knex.client"
import { createAcceptBookingUseCase } from "../../src/usecases/accept-booking.usecase"
import { KnexBookingRepository } from "../../src/ports/knex-booking.repository"
import { KnexDriverRepository } from "../../src/ports/knex-driver.repository"
import { KnexRiderRepository } from "../../src/ports/knex-rider.repository"
import { BookingStatus } from "../../src/entities/booking"

describe.skipIf(process.env.INTEGRATION !== "1")("Accept booking integration (DB)", () => {
  let trx: any
  let bookingRepo: KnexBookingRepository
  let driverRepo: KnexDriverRepository
  let riderRepo: KnexRiderRepository

  beforeAll(async () => {
    trx = await db.transaction()
    bookingRepo = new KnexBookingRepository(trx)
    driverRepo = new KnexDriverRepository(trx)
    riderRepo = new KnexRiderRepository(trx)

    await trx("riders").insert({ id: "ri_1", balance: 100, birthday: "1990-01-01" })
    await trx("drivers").insert({ id: "d_1", name: "Integration Driver" })
    await trx("bookings").insert({ id: "b_1", rider_id: "ri_1", driver_id: null, from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 20, distance_km: 10 })
  })

  afterAll(async () => {
    await trx.rollback()
  })

  test("driver accepts booking and booking/status/driver updated in DB", async () => {
    const booking = (await bookingRepo.findById("b_1"))!
    const acceptUseCase = createAcceptBookingUseCase(bookingRepo, driverRepo)

    const updated = await acceptUseCase("d_1", booking)
    expect(updated.status).toBe(BookingStatus.ACCEPTED)

    const driver = (await driverRepo.findById("d_1"))!
    expect(driver.booking?.id).toBe("b_1")

    const saved = (await bookingRepo.findById("b_1"))!
    expect(saved.status).toBe(BookingStatus.ACCEPTED)
  })
})
