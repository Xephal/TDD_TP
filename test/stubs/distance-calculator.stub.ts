import { DistanceCalculator } from "../../src/domain/interfaces/distance-calculator.interface";

export class DistanceCalculatorStub implements DistanceCalculator {
  private fakeDistance: number;
  private fakeCity: string | null;

  constructor(fakeDistance = 10, fakeCity: string | null = "Paris") {
    this.fakeDistance = fakeDistance;
    this.fakeCity = fakeCity;
  }

  async getDistanceKm(_from: string, _to: string): Promise<number> {
    return this.fakeDistance;
  }

  async getCityName(_address: string): Promise<string | null> {
    return this.fakeCity;
  }
}
