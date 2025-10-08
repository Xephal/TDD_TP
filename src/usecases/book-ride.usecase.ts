// src/usecases/book-ride.usecase.ts
import { BookingStatus, type Booking } from "../entities/Booking"
import type { Rider } from "../entities/rider"

export function calculateBasePrice(from: string, to: string): number {
  if (from === "Paris" && to === "Paris") return 2
  if (from !== "Paris" && to === "Paris") return 0
  if (from === "Paris" && to !== "Paris") return 10
  return 0
}

export function calculatePricePerKm(distance: number): number {
  return 0.5 * distance
}

export function calculateTotalPrice(from: string, to: string, distance: number): number {
  return calculateBasePrice(from, to) + calculatePricePerKm(distance)
}

export function canBook(balance: number, price: number): boolean {
  return balance >= price
}

export function canBookNewRide(booking: Booking | null): boolean {
  return booking === null
}

export function bookRide(rider: Rider, from: string, to: string, distanceKm: number): Booking {
  const total = calculateTotalPrice(from, to, distanceKm)

  if (!canBook(rider.balance, total)) throw new Error("Insufficient funds")
  if (!canBookNewRide(rider.booking)) throw new Error("Existing booking")

  const booking: Booking = {
      id: crypto.randomUUID(),
      riderId: rider.id,
      from,
      to,
      status: BookingStatus.PENDING
  }

  rider.booking = booking
  rider.balance -= total

  return booking
}
