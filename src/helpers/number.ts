export const roundNumberToDecimalPlaces = (
  number: number,
  places: number = 3
): number => {
  const h = Math.pow(10, places);
  return Math.round(number * h) / h;
};
