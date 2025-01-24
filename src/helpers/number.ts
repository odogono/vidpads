export const roundNumberToDecimalPlaces = (
  number: number,
  places: number = 3
): number => {
  const h = Math.pow(10, places);
  return Math.round(number * h) / h;
};

export const safeParseInt = (value: string, defaultTo: number = -1): number => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultTo : parsed;
};
