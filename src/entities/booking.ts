export enum BookingStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    CANCELED = "canceled",
}

export type Booking = {
    id: string
    riderId: string
    driverId?: string | null
    from: string
    to: string
    status: BookingStatus
    amount: number
    distanceKm?: number
}