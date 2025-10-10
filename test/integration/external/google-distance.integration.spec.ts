import { describe, test, expect, beforeAll } from "vitest"
import { GoogleDistanceApi } from "../../../src/api/google-distance.api"
import * as dotenv from "dotenv"

dotenv.config()

const describeIf = process.env.GOOGLE_MAPS_API_KEY ? describe : describe.skip

describeIf("GoogleDistanceApi (real HTTP integration)", () => {
  let api: GoogleDistanceApi

  beforeAll(() => {
    api = new GoogleDistanceApi()
  })

  test("returns a realistic distance between Paris and Montreuil", async () => {
    const km = await api.getDistanceKm("Paris", "Montreuil")

    expect(km).toBeGreaterThan(5)
    expect(km).toBeLessThan(20)
  })

  test("resolves a city name from an address", async () => {
    const city = await api.getCityName("3 rue Armand Moisant, 75015 Paris")
    expect(city).toBe("Paris")
  })
})
