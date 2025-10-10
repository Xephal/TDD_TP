export enum BookingStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    CANCELED = 'canceled',
}

// Booking entity: guarantees invariants on construction
export class Booking {
    id: string
    riderId: string
    driverId: string | null
    from: string
    to: string
    status: BookingStatus
    amount: number
    distanceKm: number | null
    createdAt: number

    constructor(
        id: string,
        riderId: string,
        from: string,
        to: string,
        status: BookingStatus = BookingStatus.PENDING,
        amount: number,
        createdAt: number = Date.now(),
        driverId: string | null = null,
        distanceKm: number | null = null
    ) {
        if (!id) throw new Error('Booking.id required')
        if (!riderId) throw new Error('Booking.riderId required')
        if (!from) throw new Error('Booking.from required')
        if (!to) throw new Error('Booking.to required')
        if (from === to) throw new Error('Booking.from and to must differ')
        if (amount === undefined || amount === null) throw new Error('Booking.amount required')
        if (amount <= 0) throw new Error('Booking.amount must be positive')

        this.id = id
        this.riderId = riderId
        this.from = from
        this.to = to
        this.status = status
        this.amount = amount
        this.driverId = driverId
        this.distanceKm = distanceKm
        this.createdAt = createdAt ?? Date.now()
    }

    static create(data: Partial<Omit<Booking, 'id' | 'riderId' | 'from' | 'to' | 'amount'>> & {
        id: string
        riderId: string
        from: string
        to: string
        amount: number
    }) {
        return new Booking(
            data.id,
            data.riderId,
            data.from,
            data.to,
            data.status ?? BookingStatus.PENDING,
            data.amount,
            data.createdAt ?? Date.now(),
            data.driverId ?? null,
            data.distanceKm ?? null
        )
    }
}

export type BookingShape = Booking