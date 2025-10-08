export function calculateBasePrice(from: string, to: string): number {
  if (from === "Paris" && to === "Paris") return 2
  if (from !== "Paris" && to === "Paris") return 0
  if (from === "Paris" && to !== "Paris") return 10
  return 0
}

export function calculatePricePerKm(distance: number): number {
  return 0.5 * distance
}

export function calculateTotalPrice(from: string, to: string, distance: number): number {
  return calculateBasePrice(from, to) + calculatePricePerKm(distance)
}
