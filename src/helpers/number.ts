import { Position, Rect } from '@types';

export const roundNumberToDecimalPlaces = (
  number: number,
  places: number = 3
): number => {
  const h = Math.pow(10, places);
  return Math.round(number * h) / h;
};

export const safeParseInt = (
  value: string | undefined,
  defaultTo: number = -1
): number => {
  if (!value) return defaultTo;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultTo : parsed;
};

export const safeParseFloat = (
  value: string,
  defaultTo: number = 0
): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultTo : parsed;
};

export const isPointInRect = (point: Position, rect: Rect) => {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
};

export const integerToString = (value: number = 0) => {
  return Math.round(value).toString();
};
