import { describe, test, expect, beforeEach } from "vitest"
import { bookRide, cancelBooking } from "../../src/usecases/book-ride.usecase"
import { canBook, canBookNewRide } from "../../src/domain/services/rider.service"
import { calculateBasePrice, calculateTotalPrice, calculatePricePerKm } from "../../src/domain/services/pricing.service"
import type { Rider } from "../../src/entities/rider"
import { BookingStatus } from "../../src/entities/booking"
import { RiderRepositoryFake } from "../fakes/rider.repository.fake"

describe("calculatePrice", () => {
  let riderRepository: RiderRepositoryFake

  beforeEach(() => {
    riderRepository = new RiderRepositoryFake([
      { id: "r1", balance: 50, booking: null },
      { id: "r2", balance: 20, booking: { id: "b1", riderId: "r2", from: "Paris", to: "Other", status: BookingStatus.PENDING, amount: 15 } },
      { id: "r3", balance: 50, booking: { id: "b2", riderId: "r3", from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 20 } }
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
      expect(canBook(20, 10)).toBe(true)
    })

    test("returns false when funds are insufficient", () => {
      expect(canBook(5, 10)).toBe(false)
    })

    test("returns true when activeRide is null", () => {
      const rider = riderRepository.findById("r1")!
      expect(canBookNewRide(rider.booking)).toBe(true)
    })

    test("return false when rider has an active ride", () => {
      const rider = riderRepository.findById("r2")!
      expect(canBookNewRide(rider.booking)).toBe(false)
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
      expect(rider.booking).not.toBeNull()
      expect(rider.balance).toBe(50 - ride.amount)
    })
  })

  describe("Step 5: Cancel a ride", () => {
    test("marks booking as canceled when rider cancels it", () => {
      const rider: Rider = riderRepository.findById("r3")!
      const canceled = cancelBooking(rider, riderRepository)
      expect(canceled.status).toBe(BookingStatus.CANCELED)
      expect(rider.booking).toBeNull()
    })
  })
})
