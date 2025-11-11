export interface WorkingDaysQuery {
  days?: number;
  hours?: number;
  date?: string;
}

export class WorkingDaysQueryDto {
  public static create(query: any): { error?: string; value?: WorkingDaysQuery } {
    const { days, hours, date } = query;

    if ((days === undefined || days === null) && (hours === undefined || hours === null)) {
      return { error: 'At least one of days or hours must be provided' };
    }

    let parsedDays: number | undefined;
    let parsedHours: number | undefined;

    if (days !== undefined) {
      const n = Number(days);
      if (!Number.isInteger(n) || n < 0) return { error: 'days must be a positive integer' };
      parsedDays = n;
    }

    if (hours !== undefined) {
      const n = Number(hours);
      if (!Number.isInteger(n) || n < 0) return { error: 'hours must be a positive integer' };
      parsedHours = n;
    }

    if (date !== undefined) {
      if (typeof date !== 'string') return { error: 'date must be a string in ISO 8601 UTC with Z' };
      if (!date.endsWith('Z')) return { error: 'date must be in UTC and include trailing Z' };
    }

    return { value: { days: parsedDays, hours: parsedHours, date } };
  }
}
