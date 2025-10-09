import type { Driver } from "../../src/entities/driver"
import type { DriverRepository } from "../../src/domain/repositories/driver.respository"

export class DriverRepositoryFake implements DriverRepository {
  private drivers = new Map<string, Driver>()

  constructor(drivers?: Driver[]) {
    drivers?.forEach(d => this.drivers.set(d.id, d))
  }

  findById(id: string): Driver | null {
    return this.drivers.get(id) ?? null
  }

  save(driver: Driver): void {
    this.drivers.set(driver.id, driver)
  }
}
