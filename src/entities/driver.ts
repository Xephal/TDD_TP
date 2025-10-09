import type { Booking } from "./booking"

export type Driver = {
    id: string,
    booking: Booking | null
}