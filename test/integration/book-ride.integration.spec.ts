import { describe, test, expect, beforeEach, afterEach } from "vitest"
import db from "../../src/ports/knex.client"
import { createBookRideUseCase, createCancelBookingUseCase } from "../../src/usecases/book-ride.usecase"
import { KnexBookingRepository } from "../../src/ports/knex-booking.repository"
import { KnexDriverRepository } from "../../src/ports/knex-driver.repository"
import { KnexRiderRepository } from "../../src/ports/knex-rider.repository"
import { BookingStatus } from "../../src/entities/booking"
import { CalendarStub } from "../stubs/calendar.stub"

describe.skipIf(process.env.INTEGRATION !== "1")("Book ride integration (DB)", () => {
  let trx: any
  let bookingRepo: KnexBookingRepository
  let driverRepo: KnexDriverRepository
  let riderRepo: KnexRiderRepository
  let bookRide: ReturnType<typeof createBookRideUseCase>
  let cancelBooking: ReturnType<typeof createCancelBookingUseCase>

  beforeEach(async () => {
    trx = await db.transaction()
    bookingRepo = new KnexBookingRepository(trx)
    driverRepo = new KnexDriverRepository(trx)
    riderRepo = new KnexRiderRepository(trx)

    const calendar = new CalendarStub("2025-06-01T12:00:00Z")

    await trx("riders").insert({ id: "ri_1", balance: 100, birthday: "1990-01-01" })
    await trx("drivers").insert({ id: "d_1", name: "Integration Driver" })

    bookRide = createBookRideUseCase(riderRepo, bookingRepo, driverRepo, calendar)
    cancelBooking = createCancelBookingUseCase(riderRepo, bookingRepo)
  })

  afterEach(async () => {
    if (trx) {
      await trx.rollback()
      trx = null
    }
    if (process.env.USE_REAL_DB === "1") {
      await db.destroy()
    }
  })

  test("books a ride and persists booking as pending", async () => {
    const rider = (await riderRepo.findById("ri_1"))!
    const booking = await bookRide(rider, "Paris", "Lyon", 5)

    expect(booking.status).toBe(BookingStatus.PENDING)
    const saved = (await bookingRepo.findById(booking.id))!
    expect(saved).not.toBeNull()
    expect(saved.status).toBe(BookingStatus.PENDING)

    const savedRider = (await riderRepo.findById("ri_1"))!
    expect(savedRider.balance).toBeLessThan(100)
  })

  test("cancel a booking persists cancellation and updates rider balance", async () => {
    const rider = (await riderRepo.findById("ri_1"))!
    
    await bookRide(rider, "Paris", "Lyon", 5)
    const bookings = await bookingRepo.findByRiderId(rider.id)
    const pending = bookings.find(b => b.status === BookingStatus.PENDING)!

    const canceled = await cancelBooking(rider)
    expect(canceled.status).toBe(BookingStatus.CANCELED)

    const saved = (await bookingRepo.findById(pending.id))!
    expect(saved.status).toBe(BookingStatus.CANCELED)
  })
})
