import type { Rider } from "../../entities/rider"

export interface RiderRepository {
  findById(id: string): Promise<Rider | null>
  save(rider: Rider): Promise<void>
}