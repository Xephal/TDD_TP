export interface DistanceCalculator {
  getDistanceKm(from: string, to: string): Promise<number>;
  getCityName(address: string): Promise<string | null>;
}