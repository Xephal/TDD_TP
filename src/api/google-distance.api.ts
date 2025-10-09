import { Client } from "@googlemaps/google-maps-services-js";
import * as dotenv from "dotenv";

dotenv.config();

export class GoogleDistanceApi {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async getDistanceKm(from: string, to: string): Promise<number> {
    try {
      const response = await this.client.distancematrix({
        params: {
          origins: [from],
          destinations: [to],
          key: process.env.GOOGLE_MAPS_API_KEY!,
        },
        timeout: 5000,
      });

      const rows = response.data?.rows;
      const distanceMeters = rows?.[0]?.elements?.[0]?.distance?.value;

      if (!distanceMeters && distanceMeters !== 0) {
        throw new Error("Could not retrieve distance from Google Maps API response.");
      }

      return distanceMeters / 1000;
    } catch {
      throw new Error("Impossible to calculate distance via Google Maps");
    }
  }

  async getCityName(address: string): Promise<string | null> {
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY!,
        },
        timeout: 5000,
      });

      const components =
        response.data?.results?.[0]?.address_components ?? [];

      const cityComponent = components.find((c: any) =>
        c.types.includes("locality")
      );

      return cityComponent ? cityComponent.long_name : null;
    } catch {
      return null; 
    }
  }
}
