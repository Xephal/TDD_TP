import type { Booking } from "./booking"

export type Rider = {
    id: string
    balance: number
    booking: Booking | null
}

