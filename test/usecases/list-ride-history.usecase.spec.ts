import { describe, test, expect, beforeEach } from "vitest"
import { createListRideHistoryUseCase } from "../../src/usecases/list-ride-history.usecase"
import { BookingStatus } from "../../src/entities/booking"
import { BookingRepositoryFake } from "../fakes/booking.repository.fake"
import { DriverRepositoryFake } from "../fakes/driver.repository.fake"

describe("List ride history usecase", () => {
  let bookingsFake: any

  beforeEach(() => {
    bookingsFake = new BookingRepositoryFake([
      { id: "b1", riderId: "r1", driverId: "d1", from: "Paris", to: "Lyon", status: BookingStatus.ACCEPTED, amount: 10 },
      { id: "b2", riderId: "r1", driverId: null, from: "Paris", to: "Other", status: BookingStatus.CANCELED, amount: 5 },
    ])
  })

  test("returns bookings and attaches driver name when available", async () => {
    const driversFake = new DriverRepositoryFake([
      { id: "d1", name: "Jean", booking: null },
    ] as any)
    const listHistory = createListRideHistoryUseCase(bookingsFake, driversFake as any)
    const res = await listHistory("r1")

    expect(res).toHaveLength(2)
    expect((res[0] as any).driverName).toBeUndefined()
    expect((res[1] as any).driverName).toBe("Jean")
  })

  test("sorts rides by most recent first", async () => {
  const usecase = createListRideHistoryUseCase(bookingsFake)
    const res = await usecase("r1")
    expect(res.map(r => r.id)).toEqual(["b2", "b1"])
  })

})
