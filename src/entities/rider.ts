import type { Booking } from "./Booking"

export type Rider = {
    id: string
    balance: number
    booking : Booking | null
}

