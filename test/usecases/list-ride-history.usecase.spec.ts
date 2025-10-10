import { describe, test, expect, beforeEach } from "vitest"
import { createListRideHistoryUseCase } from "../../src/usecases/list-ride-history.usecase"
import { BookingStatus } from "../../src/entities/booking"
import { BookingRepositoryFake } from "../fakes/booking.repository.fake"
import { DriverRepositoryFake } from "../fakes/driver.repository.fake"

describe("List ride history usecase", () => {
  let bookingsFake: any

  beforeEach(() => {
    // createdAt are explicit so ordering is deterministic
    bookingsFake = new BookingRepositoryFake([
      { id: "b1", riderId: "r1", driverId: "d1", from: "Paris", to: "Lyon", status: BookingStatus.ACCEPTED, amount: 10, createdAt: 1000 },
      { id: "b2", riderId: "r1", driverId: null, from: "Paris", to: "Other", status: BookingStatus.CANCELED, amount: 5, createdAt: 2000 },
    ])
  })

  test("returns bookings and attaches driver name when available", async () => {
    // arrange
    const driversFake = new DriverRepositoryFake([
      { id: "d1", name: "Jean", booking: null },
    ] as any)
    const listHistory = createListRideHistoryUseCase(bookingsFake, driversFake as any)

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
