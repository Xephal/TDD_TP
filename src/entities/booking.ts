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
    // optional timestamp (unix ms) used by use-cases for ordering
    createdAt?: number
}