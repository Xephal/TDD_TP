import { describe, test, expect, beforeEach } from "vitest"
import { createListRideHistoryUseCase } from "../../src/usecases/list-ride-history.usecase"
import { BookingStatus, Booking } from "../../src/entities/booking"
import { BookingRepositoryFake } from "../fakes/booking.repository.fake"
import { DriverRepositoryFake } from "../fakes/driver.repository.fake"

describe("List ride history usecase", () => {
  let bookingsFake: any

  beforeEach(() => {
    // createdAt are explicit so ordering is deterministic
    bookingsFake = new BookingRepositoryFake([
      new Booking('b1', 'r1', 'Paris', 'Lyon', BookingStatus.ACCEPTED, 10, 1000, 'd1', null),
      new Booking('b2', 'r1', 'Paris', 'Other', BookingStatus.CANCELED, 5, 2000, null, null),
    ])
  })

  test("returns bookings and attaches driver name when available", async () => {
    // arrange
    const driversFake = new DriverRepositoryFake([
      { id: "d1", name: "Jean", booking: null },
    ])
    const listHistory = createListRideHistoryUseCase(bookingsFake, driversFake)

    // act
    const res = await listHistory("r1")

    // assert
    expect(res).toHaveLength(2)
    // newest first: b2 then b1
    expect(res.map(r => r.id)).toEqual(["b2", "b1"])
    // driverName for the ride without a driver should be null
    expect((res[0] as any).driverName).toBeNull()
    // driverName for ride with driver should be set
    expect((res[1] as any).driverName).toBe("Jean")
  })

  test("sorts rides by most recent first", async () => {
    // arrange
    const usecase = createListRideHistoryUseCase(bookingsFake)

    // act
    const res = await usecase("r1")

    // assert
    expect(res.map(r => r.id)).toEqual(["b2", "b1"])
  })

})
