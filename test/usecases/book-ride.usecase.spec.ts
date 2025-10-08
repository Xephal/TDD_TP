import { describe, test, expect } from "vitest";
import { calculateBasePrice, calculatePricePerKm } from "../../src/usecases/book-ride.usecase";


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

    
})