import { DateTime } from 'luxon';
import { CustomError, WorkingDaysQuery } from '../domain';
import { addWorkingDays, addWorkingHours, approximateBackToWorkingTime } from '../utils';


const ZONE = 'America/Bogota';

export class WorkingDaysService {

    async calculate(query: WorkingDaysQuery): Promise<string> {
        const { days = 0, hours = 0, date } = query;

        let cursor: DateTime;
        if (date) {
            const parsed = DateTime.fromISO(date, { zone: 'utc' });
            if (!parsed.isValid) throw CustomError.badRequest('Invalid date format');
            cursor = parsed.setZone(ZONE);
        } else {
            cursor = DateTime.now().setZone(ZONE);
        }

        cursor = approximateBackToWorkingTime(cursor);

        if (days > 0) {
            cursor = addWorkingDays(cursor, days);
        }

        if (hours > 0) {
            cursor = addWorkingHours(cursor, hours);
        }

        const resultUtc = cursor.setZone('utc', { keepLocalTime: false }).toISO({ suppressMilliseconds: false });
        return resultUtc!;
    }
}
