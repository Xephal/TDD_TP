import { describe, test, expect } from "vitest";
import { calculateBasePrice } from "../../src/usecases/book-ride.usecase";


describe("calculatePrice", () => {
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