import { describe, test, expect, beforeEach } from "vitest"
import { createAcceptBookingUseCase } from "../../src/usecases/accept-booking.usecase"
import { BookingRepositoryFake } from "../fakes/booking.repository.fake"
import { DriverRepositoryFake } from "../fakes/driver.repository.fake"
import { BookingStatus } from "../../src/entities/booking"
import type { Booking } from "../../src/entities/booking"

describe("Accept booking by driver", () => {
  let bookingRepository: BookingRepositoryFake
  let driverRepository: DriverRepositoryFake
  let acceptBookingUseCase: ReturnType<typeof createAcceptBookingUseCase>

  beforeEach(() => {
    bookingRepository = new BookingRepositoryFake([
      {
        id: "b1",
        riderId: "r1",
        driverId: null,
        from: "Paris",
        to: "Lyon",
        amount: 20,
        status: BookingStatus.PENDING,
        distanceKm: 15,
      },
    ])

    driverRepository = new DriverRepositoryFake([{ id: "d1", booking: null }])
    acceptBookingUseCase = createAcceptBookingUseCase(bookingRepository, driverRepository)
  })

  test("should assign booking to driver and set status to accepted", () => {
    const booking = bookingRepository.findById("b1")!
    const updatedBooking = acceptBookingUseCase("d1", booking)

    const driver = driverRepository.findById("d1")!
    const savedBooking = bookingRepository.findById("b1")!

    expect(updatedBooking.status).toBe(BookingStatus.ACCEPTED)
    expect(driver.booking?.id).toBe("b1")
    expect(savedBooking.status).toBe(BookingStatus.ACCEPTED)
  })

  test("should throw an error if driver not found", () => {
    const booking = bookingRepository.findById("b1")!
    expect(() => acceptBookingUseCase("d999", booking)).toThrowError("Driver not found")
  })
})
