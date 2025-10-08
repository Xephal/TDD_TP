import { describe, test, expect } from "vitest";
import { calculateBasePrice, calculateTotalPrice, calculatePricePerKm, canBook } from "../../src/usecases/book-ride.usecase";


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
    })
})