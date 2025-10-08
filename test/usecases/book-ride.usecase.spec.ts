import { describe, test, expect } from "vitest";
import { bookRide, cancelBooking } from "../../src/usecases/book-ride.usecase";
import { canBook, canBookNewRide } from "../../src/domain/services/rider.service"
import { calculateBasePrice, calculateTotalPrice, calculatePricePerKm } from "../../src/domain/services/pricing.service"
import type { Rider } from "../../src/entities/rider";
import { BookingStatus, type Booking } from "../../src/entities/booking"


describe("calculatePrice", () => {
    describe("Step 1: Minimum fare", () => {
        test("should calculate the minimum fare for a Paris to Paris ride", ()=> {
            expect(calculateBasePrice("Paris", "Paris")).toBe(2)
        })
        test("should calculate the minimum fare for an outside Paris to Paris ride", ()=> {
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
            expect(canBook(20,10)).toBe(true)
        })

        test("returns false when funds are insufficient", () => {
            expect(canBook(5, 10)).toBe(false)
        })

        test("returns true when activeRide is null", () => {
            const rider = { id: "rider-1", balance: 20, booking: null } as Rider
            expect(canBookNewRide(rider.booking)).toBe(true)
        })

        test("return false when rider has an active ride"), () => {
            const rider = { id: "rider-1", balance: 20, booking: { id: "booking-1", riderId: "rider-1", from: "Paris", to: "Other" } as Booking } as Rider
            expect(canBookNewRide(rider.booking)).toBe(false)
        }

        test("marks booking as pending when created", () => {
            const rider: Rider = { id: "r1", balance: 50, booking: null }
            const booking = bookRide(rider, "Paris", "Paris", 10)
            expect(booking.status).toBe("pending")
            expect(typeof booking.amount).toBe("number")
        })

        test("books a ride when rider has funds and no active booking", () => {
            const rider: Rider = { id: "r1", balance: 50, booking: null }
            const ride = bookRide(rider, "Paris", "Paris", 10)
            expect(ride.from).toBe("Paris")
            expect(ride.to).toBe("Paris")
            expect(rider.booking).not.toBeNull()
            // rider balance should be reduced by the ride amount
            expect(rider.balance).toBe(50 - ride.amount)
        })
    })

    describe("Step 5: Cancel a ride", () => { 
        test("marks booking as canceled when rider cancels it", () => {
            const rider: Rider = { id: "r1", balance: 50, booking: { id: "b1", riderId: "r1", from: "Paris", to: "Lyon", status: BookingStatus.PENDING, amount: 20 }}
            const canceled = cancelBooking(rider)
            expect(canceled.status).toBe(BookingStatus.CANCELED)
            expect(rider.booking).toBeNull()
        })
    })
})