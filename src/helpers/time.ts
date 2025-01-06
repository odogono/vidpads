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
