import type { Rider } from "../../src/entities/rider"
import type { RiderRepository } from "../../src/domain/repositories/rider.repository"

export class RiderRepositoryFake implements RiderRepository {
  private riders = new Map<string, Rider>()

  constructor(riders?: Rider[]) {
    riders?.forEach(r => this.riders.set(r.id, r))
  }

  findById(id: string): Rider | null {
    return this.riders.get(id) ?? null
  }
}
