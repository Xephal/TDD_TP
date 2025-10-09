import type { Booking } from "../entities/booking"
import type { Driver } from "../entities/driver"
import { acceptBooking } from "../domain/services/rider.service"
import type { BookingRepository } from "../domain/repositories/booking.repository"
import type { DriverRepository } from "../domain/repositories/driver.repository"

export function createAcceptBookingUseCase(
  bookingRepo: BookingRepository,
  driverRepo: DriverRepository
) {
  return (driverId: string, booking: Booking): Booking => {
    const driver: Driver | null = driverRepo.findById(driverId)
    if (!driver) throw new Error("Driver not found")

    acceptBooking(booking, driver)

    driverRepo.save(driver)
    bookingRepo.save(booking)

    return booking
  }
}
