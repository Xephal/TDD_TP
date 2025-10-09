export * from "./driver.repository"
import type { Driver } from "../../entities/driver"

export interface DriverRepository {
  findById(id: string): Promise<Driver | null>
  save(driver: Driver): Promise<void>
}
