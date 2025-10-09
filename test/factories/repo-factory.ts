import db from "../../src/ports/knex.client"
import type { Knex } from "knex"

import { RiderRepositoryFake } from "../fakes/rider.repository.fake"
import { DriverRepositoryFake } from "../fakes/driver.repository.fake"
import { BookingRepositoryFake } from "../fakes/booking.repository.fake"

import { KnexRiderRepository } from "../../src/ports/knex-rider.repository"
import { KnexDriverRepository } from "../../src/ports/knex-driver.repository"
import { KnexBookingRepository } from "../../src/ports/knex-booking.repository"

export type Repos = {
  riderRepo: any
  driverRepo: any
  bookingRepo: any
}

export function createRepos(useRealDb = false, knexInstance?: Knex): Repos {
  if (useRealDb) {
    const k = knexInstance ?? db
    return {
      riderRepo: new KnexRiderRepository(k),
      driverRepo: new KnexDriverRepository(k),
      bookingRepo: new KnexBookingRepository(k),
    }
  }

  return {
    riderRepo: new RiderRepositoryFake(),
    driverRepo: new DriverRepositoryFake(),
    bookingRepo: new BookingRepositoryFake(),
  }
}
