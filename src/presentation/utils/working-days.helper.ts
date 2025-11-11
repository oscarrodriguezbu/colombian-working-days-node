import { DateTime } from 'luxon';
import { isHoliday } from './colombian-holidays';

const workStartHour = 8;
const lunchStartHour = 12;
const lunchEndHour = 13;
const workEndHour = 17;

export function isWorkingDay(dt: DateTime): boolean {
  const weekday = dt.weekday;
  if (weekday >= 6) return false;
  if (isHoliday(dt.toJSDate())) return false;
  return true;
}

export function approximateBackToWorkingTime(dt: DateTime): DateTime {
  let cursor = dt;

  while (!isWorkingDay(cursor)) {
    cursor = cursor.minus({ days: 1 }).set({ hour: workEndHour, minute: 0, second: 0, millisecond: 0 });
  }

  const hour = cursor.hour;
  const minute = cursor.minute;
  const inMorning = hour >= workStartHour && (hour < lunchStartHour || (hour === lunchStartHour && minute === 0));
  const inLunch = (hour >= lunchStartHour && (hour < lunchEndHour || (hour === lunchEndHour && minute === 0))) ||
    (hour === lunchStartHour && minute > 0);
  const inAfternoon = hour >= lunchEndHour && hour < workEndHour;

  if (inMorning || inAfternoon) return cursor;

  if (inLunch) {
    return cursor.set({ hour: lunchStartHour, minute: 0, second: 0, millisecond: 0 });
  }

  if (hour < workStartHour) {
    let prev = cursor.minus({ days: 1 }).set({ hour: workEndHour, minute: 0, second: 0, millisecond: 0 });
    while (!isWorkingDay(prev)) {
      prev = prev.minus({ days: 1 }).set({ hour: workEndHour, minute: 0, second: 0, millisecond: 0 });
    }
    return prev;
  }

  if (hour >= workEndHour) {
    return cursor.set({ hour: workEndHour, minute: 0, second: 0, millisecond: 0 });
  }

  return cursor;
}

export function addWorkingDays(start: DateTime, days: number): DateTime {
  let cursor = start;
  let added = 0;

  while (added < days) {
    cursor = cursor.plus({ days: 1 });
    while (!isWorkingDay(cursor)) {
      cursor = cursor.plus({ days: 1 });
    }

    const newLocal = cursor.set({
      hour: start.hour,
      minute: start.minute,
      second: start.second,
      millisecond: start.millisecond,
    });

    const preservedHour = newLocal.hour;
    if (preservedHour >= lunchStartHour && preservedHour < lunchEndHour) {
      cursor = newLocal.set({ hour: lunchStartHour, minute: 0, second: 0, millisecond: 0 });
    } else if (preservedHour < workStartHour) {
      cursor = newLocal.set({ hour: workStartHour, minute: 0, second: 0, millisecond: 0 });
    } else if (preservedHour >= workEndHour) {
      cursor = newLocal.set({ hour: workEndHour, minute: 0, second: 0, millisecond: 0 });
    } else {
      cursor = newLocal;
    }

    added += 1;
  }

  return cursor;
}

export function addWorkingHours(start: DateTime, hours: number): DateTime {
  if (hours === 0) return start;
  let cursor = start;
  let remainingMinutes = hours * 60;

  while (remainingMinutes > 0) {
    if (!isWorkingDay(cursor)) {
      cursor = cursor.plus({ days: 1 }).set({ hour: workStartHour, minute: 0, second: 0, millisecond: 0 });
      while (!isWorkingDay(cursor)) {
        cursor = cursor.plus({ days: 1 });
      }
      continue;
    }

    const currentMinutesOfDay = cursor.hour * 60 + cursor.minute;
    const morningStart = workStartHour * 60;
    const morningEnd = lunchStartHour * 60;
    const afternoonStart = lunchEndHour * 60;
    const afternoonEnd = workEndHour * 60;
    let availableMinutes = 0;

    if (currentMinutesOfDay < morningStart) {
      cursor = cursor.set({ hour: workStartHour, minute: 0, second: 0, millisecond: 0 });
      availableMinutes = morningEnd - morningStart;
    } else if (currentMinutesOfDay >= morningStart && currentMinutesOfDay < morningEnd) {
      availableMinutes = morningEnd - currentMinutesOfDay;
    } else if (currentMinutesOfDay >= morningEnd && currentMinutesOfDay < afternoonStart) {
      cursor = cursor.set({ hour: lunchEndHour, minute: 0, second: 0, millisecond: 0 });
      availableMinutes = afternoonEnd - afternoonStart;
    } else if (currentMinutesOfDay >= afternoonStart && currentMinutesOfDay < afternoonEnd) {
      availableMinutes = afternoonEnd - currentMinutesOfDay;
    } else {
      cursor = cursor.plus({ days: 1 }).set({ hour: workStartHour, minute: 0, second: 0, millisecond: 0 });
      while (!isWorkingDay(cursor)) {
        cursor = cursor.plus({ days: 1 });
      }
      availableMinutes = morningEnd - morningStart;
    }

    if (remainingMinutes <= availableMinutes) {
      cursor = cursor.plus({ minutes: remainingMinutes });
      remainingMinutes = 0;
    } else {
      cursor = cursor.plus({ minutes: availableMinutes });
      remainingMinutes -= availableMinutes;
    }
  }

  return cursor;
}
