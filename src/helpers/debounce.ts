import { clearRunAfter, runAfter, type TimeoutId } from '@helpers/time';

/**
 * Creates a debounced version of a function that delays its execution
 * until after `wait` milliseconds have elapsed since the last time it was called.
 *
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @param immediate Whether to execute the function on the leading edge instead of the trailing edge
 * @returns A debounced version of the function
 */
export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number,
  immediate: boolean = false
): ((...args: Parameters<T>) => void) => {
  let timeout: TimeoutId | undefined = undefined;

  return function (this: T, ...args: Parameters<T>): void {
    const later = () => {
      timeout = undefined;
      if (!immediate) {
        func.apply(this, args);
      }
    };

    const callNow = immediate && !timeout;

    timeout = clearRunAfter(timeout);

    timeout = runAfter(wait, later);

    if (callNow) {
      func.apply(this, args);
    }
  };
};
