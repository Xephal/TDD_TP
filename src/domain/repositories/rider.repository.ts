import type { Rider } from "../../entities/rider"

export interface RiderRepository {
  findById(id: string): Rider | null 
}