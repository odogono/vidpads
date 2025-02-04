import {
  format,
  formatDistanceToNow,
  formatISO,
  fromUnixTime,
  getUnixTime,
  parseISO
} from 'date-fns';

import { safeParseInt } from './number';

// import { createLog } from '@helpers/log';

// const log = createLog('datetime');

export const parseISO8601Duration = (duration: string) => {
  // Handle the case of empty or invalid input
  if (!duration || typeof duration !== 'string') {
    return null;
  }

  // Regular expression to match each component
  const matches = duration.match(
    /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/
  );

  if (!matches) {
    return null;
  }

  // Extract components (convert to numbers, default to 0 if not present)
  const [, years, months, days, hours, minutes, seconds] = matches.map((m) =>
    m ? parseFloat(m) : 0
  );

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    // Helper methods
    toSeconds: () =>
      seconds +
      minutes * 60 +
      hours * 3600 +
      days * 86400 +
      months * 2592000 + // Approximate, assumes 30-day month
      years * 31536000,
    toHumanReadable: () => {
      const parts = [];
      if (years) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
      if (months) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
      if (days) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
      if (hours) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
      if (minutes) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      if (seconds) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
      return parts.join(', ') || '0 seconds';
    },
    formatVideoLength: () => {
      const h = hours ? String(hours).padStart(2, '0') + ':' : '';
      const m = String(minutes).padStart(h ? 2 : 1, '0');
      const s = String(Math.round(seconds)).padStart(2, '0');
      return `${h}${m}:${s}`;
    }
  };
};

export const formatTimeAgo = (date: Date | string | undefined) => {
  if (!date) {
    return 'now';
  }
  return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, {
    addSuffix: true
  });
};

export const formatShortDate = (date: Date) => {
  return format(date, 'MMM d, yyyy');
};

export const getUnixTimeFromDate = (
  date: Date | string | undefined
): number => {
  if (!date) {
    return 0;
  }
  return getUnixTime(typeof date === 'string' ? parseISO(date) : date);
};

export const getDateFromUnixTime = (
  unixTime: number | string | undefined
): Date => {
  if (!unixTime) {
    return new Date();
  }
  return fromUnixTime(
    typeof unixTime === 'string' ? safeParseInt(unixTime) : unixTime
  );
};

export const dateToISOString = (date?: Date): string => {
  return formatISO(date ?? new Date());
};

export const isoStringToDate = (isoString: string): Date => {
  return parseISO(isoString);
};

export const createDate = (dateString?: string | undefined): Date => {
  if (!dateString) {
    return new Date();
  }
  return parseISO(dateString);
};
