/**
 * Utility functions for computing event state based on Asia/Kolkata timezone.
 */
import type { EventModel, EventStatus } from '../shared/types/festivalTypes';

/**
 * Gets the current time in IST (Asia/Kolkata).
 * Useful for all live computations.
 */
export const getCurrentIST = (): Date => {
  const dateStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(dateStr);
};

/**
 * Gets the current time string in 'HH:mm' 24-hour format in IST.
 */
export const getCurrentISTTimeString = (): string => {
  const now = getCurrentIST();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Parses a "HH:mm" time string and a YYYY-MM-DD date string into a Date object in IST.
 */
export const parseEventDateTime = (date: string, time: string): Date => {
  // We assume date is YYYY-MM-DD
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  
  // Construct a date string that specifies IST offset
  // Actually, simplest is to create Date in local timezone, but we need it to represent the IST moment.
  // The easiest way is to use ISO string with +05:30
  const dateObj = new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00+05:30`);
  return dateObj;
};

/**
 * Calculates the exact status of an event based on current IST time and its authoritative flags.
 */
export const computeEventStatus = (event: EventModel): EventStatus => {
  if (event.cancelled) return 'Cancelled';
  if (event.resultsPublished) return 'Completed';

  const nowIST = getCurrentIST();
  
  // Apply delay to scheduled start time
  const effectiveStart = parseEventDateTime(event.date, event.scheduledStartTime);
  if (event.delayMinutes > 0) {
    effectiveStart.setMinutes(effectiveStart.getMinutes() + event.delayMinutes);
  }

  const effectiveEnd = new Date(effectiveStart.getTime() + event.durationMinutes * 60000);

  if (nowIST < effectiveStart) {
    return event.delayMinutes > 0 ? 'Delayed' : 'Upcoming';
  }
  
  if (nowIST >= effectiveStart && nowIST <= effectiveEnd) {
    return 'Running';
  }

  // If time has passed but results aren't published
  return 'Results Pending';
};

/**
 * Formats a given time string 'HH:mm' to 12-hour format 'hh:mm A'
 */
export const formatTime12Hour = (time: string): string => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hours12 = h % 12 || 12;
  return `${hours12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Calculates the effective start time as a string.
 */
export const getEffectiveStartTime = (event: EventModel): string => {
  const d = parseEventDateTime(event.date, event.scheduledStartTime);
  d.setMinutes(d.getMinutes() + event.delayMinutes);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Calculates the effective end time as a string.
 */
export const getEffectiveEndTime = (event: EventModel): string => {
  const d = parseEventDateTime(event.date, event.scheduledStartTime);
  d.setMinutes(d.getMinutes() + event.delayMinutes + event.durationMinutes);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};
