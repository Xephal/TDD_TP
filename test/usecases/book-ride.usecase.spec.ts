import { describe, test, expect, beforeEach, afterEach } from "vitest"
import { createBookRideUseCase, createCancelBookingUseCase } from "../../src/usecases/book-ride.usecase"
import { canBookRide, checkBalance, hasNoPendingRide, acceptBooking } from "../../src/domain/services/rider.service"
import { calculateBasePrice, calculateTotalPrice, calculatePricePerKm } from "../../src/domain/services/pricing.service"
import { BookingStatus } from "../../src/entities/booking"
import { RiderRepositoryFake } from "../fakes/rider.repository.fake"
import { DriverRepositoryFake } from "../fakes/driver.repository.fake"
import { BookingRepositoryFake } from "../fakes/booking.repository.fake"
import { createRepos } from "../factories/repo-factory"
import db from "../../src/ports/knex.client"
import type { Rider } from "../../src/entities/rider"
import type { Driver } from "../../src/entities/driver"
import type { Booking } from "../../src/entities/booking"
import { CalendarStub } from "../stubs/calendar.stub"

describe("BookRide UseCase", () => {
  let riderRepository: any
  let driverRepository: any
  let bookingRepository: any
  let bookRide: ReturnType<typeof createBookRideUseCase>
  let cancelBooking: ReturnType<typeof createCancelBookingUseCase>
  let trx: any | null = null

  beforeEach(async () => {
  const useReal = process.env.USE_REAL_DB === "1"
  const calendar = new CalendarStub("2025-06-01T12:00:00Z") 

  if (useReal) {
    trx = await db.transaction()
    const repos = createRepos(true, trx)
    riderRepository = repos.riderRepo
    driverRepository = repos.driverRepo
    bookingRepository = repos.bookingRepo

    await trx("riders").insert([
      { id: "r1", balance: 50, birthday: "1990-06-15" },
      { id: "r2", balance: 20, birthday: "1985-12-20" },
      { id: "r3", balance: 50, birthday: "1992-03-10" },
      { id: "r4", balance: 50, birthday: "2000-06-15" },
      { id: "r5", balance: 50, birthday: "1995-11-25" },
      { id: "r6", balance: 50, birthday: new Date() },
    ])

    await trx("drivers").insert([{ id: "d1", name: null }])

    await trx("bookings").insert([
      { id: "b1", rider_id: "r2", driver_id: null, from: "Paris", to: "Other", status: BookingStatus.PENDING, amount: 15 },
      { id: "b2", rider_id: "r3", driver_id: null, from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 20 },
      { id: "b_accepted", rider_id: "r4", driver_id: null, from: "Paris", to: "Lyon", status: BookingStatus.ACCEPTED, amount: 15 },
      { id: "b_canceled", rider_id: "r5", driver_id: null, from: "Paris", to: "Lyon", status: BookingStatus.CANCELED, amount: 15 },
      { id: "b_accepted_r6", rider_id: "r6", driver_id: null, from: "Paris", to: "Lyon", status: BookingStatus.ACCEPTED, amount: 15 },
    ])
  } else {
    const repos = createRepos(false)
    bookingRepository = repos.bookingRepo
    driverRepository = repos.driverRepo
    riderRepository = new RiderRepositoryFake([
      { id: "r1", balance: 50, booking: [], birthday: new Date("1990-06-15") },
      { id: "r2", balance: 20, booking: [{ id: "b1", riderId: "r2", from: "Paris", to: "Other", status: BookingStatus.PENDING, amount: 15 }], birthday: new Date("1985-12-20") },
      { id: "r3", balance: 50, booking: [{ id: "b2", riderId: "r3", from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 20 }], birthday: new Date("1992-03-10") },
      { id: "r4", balance: 50, booking: [{ id: "b_accepted", riderId: "r4", from: "Paris", to: "Lyon", status: BookingStatus.ACCEPTED, amount: 15 }], birthday: new Date("2000-06-15") },
      { id: "r5", balance: 50, booking: [{ id: "b_canceled", riderId: "r5", from: "Paris", to: "Lyon", status: BookingStatus.CANCELED, amount: 15 }], birthday: new Date("1995-11-25") },
      { id: "r6", balance: 50, booking: [{ id: "b_accepted", riderId: "r6", from: "Paris", to: "Lyon", status: BookingStatus.ACCEPTED, amount: 15 }], birthday: new Date() },
    ])

    await bookingRepository.save({ id: "b1", riderId: "r2", driverId: null, from: "Paris", to: "Other", status: BookingStatus.PENDING, amount: 15 })
    await bookingRepository.save({ id: "b2", riderId: "r3", driverId: null, from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 20 })
    await bookingRepository.save({ id: "b_accepted", riderId: "r4", driverId: null, from: "Paris", to: "Lyon", status: BookingStatus.ACCEPTED, amount: 15 })
    await bookingRepository.save({ id: "b_canceled", riderId: "r5", driverId: null, from: "Paris", to: "Lyon", status: BookingStatus.CANCELED, amount: 15 })
    await bookingRepository.save({ id: "b_accepted_r6", riderId: "r6", driverId: null, from: "Paris", to: "Lyon", status: BookingStatus.ACCEPTED, amount: 15 })
    await driverRepository.save({ id: "d1", booking: null })
  }

  bookRide = createBookRideUseCase(riderRepository, bookingRepository, driverRepository, calendar)
  cancelBooking = createCancelBookingUseCase(riderRepository, bookingRepository)
})


  afterEach(async () => {
    if (trx) {
      await trx.rollback()
      trx = null
    }
  })

  describe("Step 1: Minimum fare", () => {
    test("should calculate the minimum fare for a Paris to Paris ride", () => {
      expect(calculateBasePrice("Paris", "Paris")).toBe(2)
    })
    test("should calculate the minimum fare for an outside Paris to Paris ride", () => {
      expect(calculateBasePrice("Other", "Paris")).toBe(0)
    })
    test("should calculate the minimum fare for a Paris to outside Paris ride", () => {
      expect(calculateBasePrice("Paris", "Other")).toBe(10)
    })
  })

  describe("Step 2: Price per km", () => {
    test("should calculate price per km", () => {
      const distancefare = calculatePricePerKm(10)
      expect(distancefare).toBe(0.5 * 10)
    })
  })

  describe("Step 3: Total price", () => {
    test("should add distance fare to the base fare", () => {
      const total = calculateTotalPrice("Paris", "Paris", 10)
      expect(total).toBe(2 + 0.5 * 10)
    })
  })

  describe("Step 4: Book a ride", () => {
    test("return true if balance is superior to the ride price", () => {
      expect(checkBalance(20, 10)).toBe(true)
    })

    test("returns false when funds are insufficient", () => {
      expect(checkBalance(5, 10)).toBe(false)
    })

    test("returns true when activeRide is null", async () => {
      const rider = (await riderRepository.findById("r1"))!
      expect(hasNoPendingRide(rider.booking)).toBe(true)
    })

    test("return false when rider has an active ride", async () => {
      const rider = (await riderRepository.findById("r2"))!
      expect(hasNoPendingRide(rider.booking)).toBe(false)
    })

    test("marks booking as pending when created", async () => {
      const rider = (await riderRepository.findById("r1"))!
      const booking = await bookRide(rider, "Paris", "Paris", 10)
      expect(booking.status).toBe("pending")
      expect(typeof booking.amount).toBe("number")
    })

    test("books a ride when rider has funds and no active booking", async () => {
      const rider = (await riderRepository.findById("r1"))!
      const ride = await bookRide(rider, "Paris", "Paris", 10)
      expect(ride.from).toBe("Paris")
      expect(ride.to).toBe("Paris")
      expect(rider.booking.length).toBe(1)
      expect(rider.balance).toBe(50 - ride.amount)
    })

    test("rider should not be able to book a ride if he has a pending booking", async () => {
      const rider2 = (await riderRepository.findById("r2"))!    
      const newBooking2: Booking = { id: "b4", riderId: "r2", from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 20, distanceKm:3 }
      const check2 = canBookRide(rider2, newBooking2)
      expect(check2).toBe(false)
    })

    test("rider can book a ride if he has no pending booking", async () => {
      const rider1 = (await riderRepository.findById("r1"))!
      const newBooking1:Booking = { id: "b3", riderId: "r1", from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 5 ,distanceKm:3}
      const check1 = canBookRide(rider1, newBooking1)
      expect(check1).toBe(true)
    })

    test("if we use UberX, 5 euros should be added to the ride (it's not the rider's birthday)", async () => {
      const rider = (await riderRepository.findById("r1"))!
      const booking = await bookRide(rider, "Paris", "Lyon", 10, true)
      expect(rider.balance).toBe(50 - (booking.amount))
    })

    test("should double the fare if ride is booked on Christmas Day", async () => {
      const calendar = new CalendarStub("2025-12-25T12:00:00Z")
      bookRide = createBookRideUseCase(riderRepository, bookingRepository, driverRepository, calendar)

      const rider = (await riderRepository.findById("r1"))!
      const booking = await bookRide(rider, "Paris", "Lyon", 10)
      expect(booking.amount).toBe(30)
})
  })

  describe("Step 5: Cancel a ride", () => {
    test("marks booking as canceled when rider cancels it", async () => {
      const rider: Rider = (await riderRepository.findById("r3"))!
      const canceled = await cancelBooking(rider)
      expect(canceled.status).toBe(BookingStatus.CANCELED)
      expect(rider.balance).toBe(70)
    }) 
    
    test("marks booking as canceled when rider cancels an accepted booking and take a 5 euro fee", async () => {
      const rider = (await riderRepository.findById("r4"))!
      const canceled = await cancelBooking(rider)
      expect(canceled.status).toBe(BookingStatus.CANCELED)
      expect(rider.balance).toBe(50 + 15 - 5)
    })

    test("if a ride is already canceled, it should not be canceled again", async () => {
      const rider: Rider = (await riderRepository.findById("r5"))!
      await expect(cancelBooking(rider)).rejects.toThrowError("No booking to cancel")
    })
    
    test("if it's the birthday of the rider, no cancellation fee should be applied", async () => {
      const rider: Rider = (await riderRepository.findById("r6"))!
      const canceled = await cancelBooking(rider)
      expect(canceled.status).toBe(BookingStatus.CANCELED)
      expect(rider.balance).toBe(50 + 15)
    })

    test("marks booking as confirmed when driver accepts it", async () => {
      const rider: Rider = (await riderRepository.findById("r1"))!
      const driver = (await driverRepository.findById("d1"))! 
      const newBooking = await bookRide(rider, "Paris", "Lyon", 3)
      acceptBooking(newBooking, driver)
      if (process.env.USE_REAL_DB === "1") {
        await bookingRepository.save(newBooking)
        await driverRepository.save(driver)
      }
      expect(newBooking.status).toBe(BookingStatus.ACCEPTED)
      expect(driver.booking).toBe(newBooking)
      const savedDriver = (await driverRepository.findById("d1"))!
      expect(savedDriver.booking?.id).toBe(newBooking.id)
    })
  })
})
