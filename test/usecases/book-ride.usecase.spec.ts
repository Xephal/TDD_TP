import { describe, test, expect, beforeEach } from "vitest"
import { bookRide, cancelBooking } from "../../src/usecases/book-ride.usecase"
import { canBookRide, checkBalance, hasNoPendingRide } from "../../src/domain/services/rider.service"
import { calculateBasePrice, calculateTotalPrice, calculatePricePerKm } from "../../src/domain/services/pricing.service"
import type { Rider } from "../../src/entities/rider"
import { BookingStatus } from "../../src/entities/booking"
import { RiderRepositoryFake } from "../fakes/rider.repository.fake"
import type { Booking } from "../../src/entities/booking"

describe("calculatePrice", () => {
  let riderRepository: RiderRepositoryFake

  beforeEach(() => {
    riderRepository = new RiderRepositoryFake([
      { id: "r1", balance: 50, booking : [] },
    { id: "r2", balance: 20, booking: [{id: "b1", riderId: "r2", from: "Paris", to: "Other", status: BookingStatus.PENDING, amount: 15 }] },
      { id: "r3", balance: 50, booking: [{ id: "b2", riderId: "r3", from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 20 }] }
    ])
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
      const booking = bookRide(rider, "Paris", "Paris", 10, riderRepository)
      expect(booking.status).toBe("pending")
      expect(typeof booking.amount).toBe("number")
    })

    test("books a ride when rider has funds and no active booking", () => {
      const rider = riderRepository.findById("r1")!
      const ride = bookRide(rider, "Paris", "Paris", 10, riderRepository)
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
      const canceled = cancelBooking(rider, riderRepository)
      expect(canceled.status).toBe(BookingStatus.CANCELED)
    })
  })
})
