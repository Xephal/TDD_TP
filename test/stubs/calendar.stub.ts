import type { Calendar } from "../../src/domain/interfaces/calendar.service"

export class CalendarStub implements Calendar {
  private readonly fixedDate: Date

  constructor(dateString: string) {
    this.fixedDate = new Date(dateString)
  }

  today(): Date {
    return this.fixedDate
  }
}
