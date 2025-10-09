import { BookingStatus, type Booking } from "../../entities/booking"
import type { Driver } from "../../entities/driver"
import type { Rider } from "../../entities/rider"
import { calculateTotalPrice } from "./pricing.service"

export function checkBalance(balance: number, price: number): boolean {
  return balance >= price
}

export function hasNoPendingRide(booking: Booking[]): boolean {
  if (booking.length === 0) return true
  return booking.every(b => b.status != "pending")
}

export function canBookRide(rider: Rider, booking: Booking): boolean {
  const price = calculateTotalPrice(booking.from, booking.to, booking.distanceKm!)
  return checkBalance(rider.balance, price) && hasNoPendingRide(rider.booking)
}

export function acceptBooking(booking: Booking, driver: Driver): void {
  if (booking.status !== "pending") throw new Error("Booking is not pending")
  booking.status = BookingStatus.ACCEPTED
  driver.booking = booking
  booking.driverId = driver.id
}
