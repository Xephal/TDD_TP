import type { Booking } from "./booking"

export type Driver = {
    id: string,
    name?: string | null,
    booking: Booking | null
}