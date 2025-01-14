import { formatDistanceToNow } from 'date-fns';

import { createLog } from '@helpers/log';

const log = createLog('datetime');

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

export const formatTimeAgo = (date: Date) => {
  return formatDistanceToNow(date, { addSuffix: true });
};
