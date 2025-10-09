import type { Driver } from "../../entities/driver"

export interface DriverRepository {
  findById(id: string): Driver | null
}