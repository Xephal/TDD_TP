import type { Booking } from "../../entities/booking"

export function canBook(balance: number, price: number): boolean {
  return balance >= price
}

export function canBookNewRide(booking: Booking | null): boolean {
  return booking === null
}
