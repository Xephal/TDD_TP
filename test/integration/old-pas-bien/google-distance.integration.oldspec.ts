import { describe, test, expect } from "vitest"
import { GoogleDistanceApi } from "../../../src/api/google-distance.api"
import * as dotenv from "dotenv"

dotenv.config()

describe.skipIf(!process.env.GOOGLE_MAPS_API_KEY)("GoogleDistanceApi (real API)", () => {
  const api = new GoogleDistanceApi()

  test("should return a positive distance between Paris and Montreuil", async () => {
    const km = await api.getDistanceKm("Paris", "Montreuil")
    console.log("Distance Paris → Montreuil =", km, "km")

    expect(km).toBeGreaterThan(5)
    expect(km).toBeLessThan(20)
  })

  test("should return a city name from an address", async () => {
    const city = await api.getCityName("3 rue Armand Moisant, 75015 Paris")
    console.log("Resolved city name:", city)

    expect(city).toBe("Paris")
  })
})

// C'était bien, j'ai juste déplacé tout rapidemment et je l'ai foutu ailleurs
