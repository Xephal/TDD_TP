import type { Rider } from "../../src/entities/rider"
import type { RiderRepository } from "../../src/domain/repositories/rider.repository"

export class RiderRepositoryFake implements RiderRepository {
  private riders = new Map<string, Rider>()

  constructor(riders?: Rider[]) {
    riders?.forEach(r => this.riders.set(r.id, r))
  }

  async findById(id: string): Promise<Rider | null> {
    return this.riders.get(id) ?? null
  }

  async save(rider: Rider): Promise<void> {
    this.riders.set(rider.id, rider)
  }
}
