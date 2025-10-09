import type { Driver } from "../../src/entities/driver"
import type { DriverRepository } from "../../src/domain/repositories/driver.repository"

export class DriverRepositoryFake implements DriverRepository {
  private drivers = new Map<string, Driver>()

  constructor(drivers?: Driver[]) {
    drivers?.forEach(d => this.drivers.set(d.id, d))
  }

  async findById(id: string): Promise<Driver | null> {
    return this.drivers.get(id) ?? null
  }

  async save(driver: Driver): Promise<void> {
    this.drivers.set(driver.id, driver)
  }
}
