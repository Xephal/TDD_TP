import { describe, test, expect, beforeEach, afterEach } from "vitest"
import { createAcceptBookingUseCase } from "../../src/usecases/accept-booking.usecase"
import { createRepos } from "../factories/repo-factory"
import db from "../../src/ports/knex.client"
import { BookingStatus } from "../../src/entities/booking"
import type { Booking } from "../../src/entities/booking"

describe("Accept booking by driver", () => {
  let bookingRepository: any
  let driverRepository: any
  let acceptBookingUseCase: ReturnType<typeof createAcceptBookingUseCase>
  let trx: any | null = null

  beforeEach(async () => {
    const useReal = process.env.USE_REAL_DB === "1"
    if (useReal) {
      trx = await db.transaction()
      const repos = createRepos(true, trx)
      bookingRepository = repos.bookingRepo
      driverRepository = repos.driverRepo
      await trx("drivers").insert({ id: "d1", name: "Driver DB" })
      await trx("riders").insert({ id: "r1", balance: 100, birthday: "1990-01-01" })
      await trx("bookings").insert({ id: "b1", rider_id: "r1", driver_id: null, from: "Paris", to: "Lyon", amount: 20, status: BookingStatus.PENDING })
    } else {
      const repos = createRepos(false)
      bookingRepository = repos.bookingRepo
      driverRepository = repos.driverRepo
      await bookingRepository.save({ id: "b1", riderId: "r1", driverId: null, from: "Paris", to: "Lyon", amount: 20, status: BookingStatus.PENDING, distanceKm: 15 })
      await driverRepository.save({ id: "d1", booking: null })
    }

    acceptBookingUseCase = createAcceptBookingUseCase(bookingRepository, driverRepository)
  })

  afterEach(async () => {
    if (trx) {
      await trx.rollback()
      trx = null
    }
  })

  test("should assign booking to driver and set status to accepted", async () => {
    const booking = (await bookingRepository.findById("b1"))!
    const updatedBooking = await acceptBookingUseCase("d1", booking)

    const driver = (await driverRepository.findById("d1"))!
    const savedBooking = (await bookingRepository.findById("b1"))!

    expect(updatedBooking.status).toBe(BookingStatus.ACCEPTED)
    expect(driver.booking?.id).toBe("b1")
    expect(savedBooking.status).toBe(BookingStatus.ACCEPTED)
  })

  test("should throw an error if driver not found", async () => {
    const booking = (await bookingRepository.findById("b1"))!
    await expect(acceptBookingUseCase("d999", booking)).rejects.toThrowError("Driver not found")
  })
})
