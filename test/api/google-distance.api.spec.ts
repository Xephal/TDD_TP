import { describe, test, expect, vi, beforeEach } from "vitest"
import { GoogleDistanceApi } from "../../src/api/google-distance.api"
import { Client } from "@googlemaps/google-maps-services-js"

vi.mock("@googlemaps/google-maps-services-js", () => {
  const mockClient = {
    distancematrix: vi.fn(),
    geocode: vi.fn(),
  }
  return { Client: vi.fn(() => mockClient) }
})

describe("GoogleDistanceScanner", () => {
  let scanner: GoogleDistanceApi
  let mockClient: any

  beforeEach(() => {
    scanner = new GoogleDistanceApi()
    mockClient = (Client as unknown as ReturnType<typeof vi.fn>).mock.results[0].value
  })

  describe("Distance API call", () => {
    test("should call Google Distance Matrix API with correct params", async () => {
      mockClient.distancematrix.mockResolvedValueOnce({
        data: { rows: [{ elements: [{ distance: { value: 1000 } }] }] },
      })

      await scanner.getDistanceKm("Paris", "Lyon")

      expect(mockClient.distancematrix).toHaveBeenCalledWith({
        params: expect.objectContaining({
          origins: ["Paris"],
          destinations: ["Lyon"],
          key: expect.any(String),
        }),
        timeout: expect.any(Number),
      })
    })
  })

  describe("Distance", () => {
    test("should return distance in kilometers", async () => {
      mockClient.distancematrix.mockResolvedValueOnce({
        data: { rows: [{ elements: [{ distance: { value: 12345 } }] }] },
      })

      const km = await scanner.getDistanceKm("Paris", "Lyon")
      expect(km).toBeCloseTo(12.345, 3)
    })
  })

  describe("Distance errors", () => {
    test("should throw error if API fails", async () => {
      mockClient.distancematrix.mockRejectedValueOnce(new Error("API error"))
      await expect(scanner.getDistanceKm("Paris", "Lyon")).rejects.toThrow(
        "Impossible to calculate distance via Google Maps"
      )
    })
  })

  describe("Get City", () => {
    test("should get city name from address", async () => {
      mockClient.geocode.mockResolvedValueOnce({
        data: {
          results: [
            {
              address_components: [
                { long_name: "Paris", types: ["locality", "political"] },
                { long_name: "Île-de-France", types: ["administrative_area_level_1"] },
              ],
            },
          ],
        },
      })

      const city = await scanner.getCityName("10 rue de Rivoli, Paris")
      expect(city).toBe("Paris")
    })

    test("should return null when no city found", async () => {
      mockClient.geocode.mockResolvedValueOnce({
        data: { results: [{ address_components: [] }] },
      })
      const city = await scanner.getCityName("Unknown")
      expect(city).toBeNull()
    })

    test("should handle API error", async () => {
      mockClient.geocode.mockRejectedValueOnce(new Error("Network error"))
      const city = await scanner.getCityName("Paris")
      expect(city).toBeNull()
    })
  })
})
