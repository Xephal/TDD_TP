export interface Calendar {
  today(): Date
}

export class SystemCalendar implements Calendar {
  today(): Date {
    return new Date()
  }
}