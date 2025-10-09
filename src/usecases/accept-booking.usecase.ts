import type { Booking } from "../entities/booking"
import type { Driver } from "../entities/driver"
import { acceptBooking } from "../domain/services/rider.service"
import type { BookingRepository } from "../domain/repositories/booking.repository"
import type { DriverRepository } from "../domain/repositories/driver.repository"

export function createAcceptBookingUseCase(
  bookingRepo: BookingRepository,
  driverRepo: DriverRepository
) {
  return async (driverId: string, booking: Booking): Promise<Booking> => {
    const driver: Driver | null = await driverRepo.findById(driverId)
    if (!driver) throw new Error("Driver not found")

    acceptBooking(booking, driver)

    await driverRepo.save(driver)
    await bookingRepo.save(booking)

    return booking
  }
}
