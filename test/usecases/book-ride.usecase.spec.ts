import { describe, test, expect, beforeEach } from "vitest"
import { createBookRideUseCase, createCancelBookingUseCase } from "../../src/usecases/book-ride.usecase"
import { canBookRide, checkBalance, hasNoPendingRide, acceptBooking } from "../../src/domain/services/rider.service"
import { calculateBasePrice, calculateTotalPrice, calculatePricePerKm } from "../../src/domain/services/pricing.service"
import { BookingStatus } from "../../src/entities/booking"
import { RiderRepositoryFake } from "../fakes/rider.repository.fake"
import { DriverRepositoryFake } from "../fakes/driver.repository.fake"
import { BookingRepositoryFake } from "../fakes/booking.repository.fake"
import type { Rider } from "../../src/entities/rider"
import type { Driver } from "../../src/entities/driver"
import type { Booking } from "../../src/entities/booking"

describe("BookRide UseCase", () => {
  let riderRepository: RiderRepositoryFake
  let driverRepository: DriverRepositoryFake
  let bookingRepository: BookingRepositoryFake
  let bookRide: ReturnType<typeof createBookRideUseCase>
  let cancelBooking: ReturnType<typeof createCancelBookingUseCase>

  beforeEach(() => {
    riderRepository = new RiderRepositoryFake([
      { id: "r1", balance: 50, booking : [], birthday: new Date("1990-06-15") },
      { id: "r2", balance: 20, booking: [{id: "b1", riderId: "r2", from: "Paris", to: "Other", status: BookingStatus.PENDING, amount: 15 }], birthday: new Date("1985-12-20") },
      { id: "r3", balance: 50, booking: [{ id: "b2", riderId: "r3", from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 20 }], birthday: new Date("1992-03-10") },
      { id: "r4", balance: 50, booking: [{ id: "b_accepted", riderId: "r4", from: "Paris", to: "Lyon", status: BookingStatus.ACCEPTED, amount: 15 }], birthday: new Date("2000-06-15") },
      { id: "r5", balance: 50, booking: [{ id: "b_canceled", riderId: "r5", from: "Paris", to: "Lyon", status: BookingStatus.CANCELED, amount: 15 }], birthday: new Date("1995-11-25")},
      { id: "r6", balance: 50, booking: [{ id: "b_accepted", riderId: "r6", from: "Paris", to: "Lyon", status: BookingStatus.ACCEPTED, amount: 15 }], birthday: new Date() },
    ])
    driverRepository = new DriverRepositoryFake([{ id: "d1", booking: null }])
    bookingRepository = new BookingRepositoryFake()
    
    bookRide = createBookRideUseCase(riderRepository, bookingRepository, driverRepository)
    cancelBooking = createCancelBookingUseCase(riderRepository, bookingRepository)
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

    test("returns true when activeRide is null", () => {
      const rider = riderRepository.findById("r1")!
      expect(hasNoPendingRide(rider.booking)).toBe(true)
    })

    test("return false when rider has an active ride", () => {
      const rider = riderRepository.findById("r2")!
      expect(hasNoPendingRide(rider.booking)).toBe(false)
    })

    test("marks booking as pending when created", () => {
      const rider = riderRepository.findById("r1")!
      const booking = bookRide(rider, "Paris", "Paris", 10)
      expect(booking.status).toBe("pending")
      expect(typeof booking.amount).toBe("number")
    })

    test("books a ride when rider has funds and no active booking", () => {
      const rider = riderRepository.findById("r1")!
      const ride = bookRide(rider, "Paris", "Paris", 10)
      expect(ride.from).toBe("Paris")
      expect(ride.to).toBe("Paris")
      expect(rider.booking.length).toBe(1)
      expect(rider.balance).toBe(50 - ride.amount)
    })

    test("rider should not be able to book a ride if he has a pending booking", () => {
      const rider2 = riderRepository.findById("r2")!    
      const newBooking2: Booking = { id: "b4", riderId: "r2", from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 20, distanceKm:3 }
      const check2 = canBookRide(rider2, newBooking2)
      expect(check2).toBe(false)
    })

    test("rider can book a ride if he has no pending booking", () => {
      const rider1 = riderRepository.findById("r1")!
      const newBooking1:Booking = { id: "b3", riderId: "r1", from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 5 ,distanceKm:3}
      const check1 = canBookRide(rider1, newBooking1)
      expect(check1).toBe(true)
    })
  })

  describe("Step 5: Cancel a ride", () => {
    test("marks booking as canceled when rider cancels it", () => {
      const rider: Rider = riderRepository.findById("r3")!
      const canceled = cancelBooking(rider)
      expect(canceled.status).toBe(BookingStatus.CANCELED)
      expect(rider.balance).toBe(70)
    }) 
    
    test("marks booking as canceled when rider cancels an accepted booking and take a 5 euro fee", () => {
      const rider = riderRepository.findById("r4")!
      const canceled = cancelBooking(rider)
      expect(canceled.status).toBe(BookingStatus.CANCELED)
      expect(rider.balance).toBe(50 + 15 - 5)
    })

    test("if a ride is already canceled, it should not be canceled again", () => {
      const rider: Rider = riderRepository.findById("r5")!
      expect(() => cancelBooking(rider)).toThrowError("No booking to cancel")
    })
    
    test("if it's the birthday of the rider, no cancellation fee should be applied", () => {
      const rider: Rider = riderRepository.findById("r6")!
      const canceled = cancelBooking(rider)
      expect(canceled.status).toBe(BookingStatus.CANCELED)
      expect(rider.balance).toBe(50 + 15)
    })

    test("marks booking as confirmed when driver accepts it", () => {
      const rider: Rider = riderRepository.findById("r1")!
      const driver: Driver = { id: "d1", booking: null }
      const newBooking = bookRide(rider, "Paris", "Lyon", 3)
      acceptBooking(newBooking, driver)
      expect(newBooking.status).toBe(BookingStatus.ACCEPTED)
      expect(driver.booking).toBe(newBooking)
    })
  })
})
