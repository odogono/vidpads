/**
 * Converts a time string in format "HH:mm:ss" to seconds
 * @param timeStr Time string in format "HH:mm:ss"
 * @returns Number of seconds
 */
export const timeStringToSeconds = (timeStr: string): number => {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Converts seconds to a time string in format "HH:mm:ss"
 * @param seconds Number of seconds
 * @returns Time string in format "HH:mm:ss"
 */
export const secondsToTimeString = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [hours, minutes, secs]
    .map((val) => val.toString().padStart(2, '0'))
    .join(':');
};

export const secondsToHex = (value: number, places: number = 3): string => {
  const h = Math.pow(10, places);
  const ms = Math.round(value * h);
  return ms.toString(16);
};

export const hexToSeconds = (value: string, places: number = 3): number => {
  const h = Math.pow(10, places);
  const ms = parseInt(value, 16);
  return ms / h;
};

/**
 * Converts a time string in format "HH:mm:ss" to microseconds
 * @param timeStr Time string in format "HH:mm:ss"
 * @returns Number of microseconds
 */
export const timeStringToMicroSeconds = (timeStr: string): number =>
  timeStringToSeconds(timeStr) * 1000000;

/**
 * Converts microseconds to a time string in format "HH:mm:ss"
 * @param microSeconds Number of microseconds
 * @returns Time string in format "HH:mm:ss"
 */
export const microSecondsToTimeString = (microSeconds: number): string =>
  secondsToTimeString(microSeconds / 1000000);

export const formatTimeToString = (timeInSeconds: number) => {
  // Handle negative numbers
  const isNegative = timeInSeconds < 0;
  timeInSeconds = Math.abs(timeInSeconds);

  // Calculate components
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.round((timeInSeconds % 1) * 1000);

  // Format components with padding
  const minutesStr = minutes.toString().padStart(3, '0');
  const secondsStr = seconds.toString().padStart(2, '0');
  const millisecondsStr = milliseconds.toString().padStart(3, '0');

  // Combine with sign if negative
  return `${isNegative ? '-' : ''}${minutesStr}:${secondsStr}:${millisecondsStr}`;
};

export const formatTimeStringToSeconds = (timeString: string) => {
  if (!timeString) {
    // TODO get rid of throwing errors
    throw new Error('Invalid time string');
  }
  // try and parse just as a number first
  const number = Number(timeString);
  if (!isNaN(number)) {
    return number;
  }

  // Check if the string matches the expected format
  const regex = /^(-)?(\d{1,}):(\d{1,}):(\d{1,})$/;
  const match = timeString.match(regex);

  if (!match) {
    throw new Error(
      'Invalid time format. Expected format: MM:SS:MS (e.g., 00:01:240 or -01:02:500)'
    );
  }

  // Extract components from matched groups
  const [, negative, minutesStr, secondsStr, millisecondsStr] = match;

  // Convert strings to numbers
  const minutes = parseInt(minutesStr, 10);
  const seconds = parseInt(secondsStr, 10);
  const milliseconds = parseInt(millisecondsStr.padEnd(3, '0'), 10);

  // Validate ranges
  if (seconds >= 60) {
    throw new Error('Seconds must be less than 60');
  }
  if (milliseconds >= 1000) {
    throw new Error(`Milliseconds must be less than 1000 (${timeString})`);
  }

  // Calculate total seconds
  let totalSeconds = minutes * 60 + seconds + milliseconds / 1000;

  // Apply negative sign if present
  if (negative) {
    totalSeconds = -totalSeconds;
  }

  return totalSeconds;
};

/**
 * Waits for a given number of milliseconds
 * @param time Number of milliseconds to wait
 * @returns Promise that resolves after the given time
 */
export const wait = async (time: number = 1000): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

export type TimeoutId = ReturnType<typeof setTimeout>;

/**
 * Runs a function after a given number of milliseconds
 * @param time Number of milliseconds to wait
 * @param fn Function to run
 */
export const runAfter = (time: number, fn: () => void): TimeoutId =>
  setTimeout(() => fn(), time);

export const clearRunAfter = (timeoutId: TimeoutId | null | undefined) => {
  if (!timeoutId) return undefined;
  clearTimeout(timeoutId);
  return undefined;
};
