export enum BookingStatus {
    PENDING = "pending",
    CANCELED = "canceled",
}

export type Booking = {
    id: string
    riderId: string
    from: string
    to: string
    status: BookingStatus
    amount: number
    distanceKm?: number
}