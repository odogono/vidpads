import { roundNumberToDecimalPlaces } from '../number';

describe('roundNumberToDecimalPlaces', () => {
  it('should trim number to 3 decimal places by default', () => {
    expect(roundNumberToDecimalPlaces(1.2345)).toBe(1.235);
    expect(roundNumberToDecimalPlaces(1.2344)).toBe(1.234);
    expect(roundNumberToDecimalPlaces(1)).toBe(1);
  });

  it('should trim number to specified decimal places', () => {
    expect(roundNumberToDecimalPlaces(1.2345, 2)).toBe(1.23);
    expect(roundNumberToDecimalPlaces(1.2356, 2)).toBe(1.24);
    expect(roundNumberToDecimalPlaces(1.2, 4)).toBe(1.2);
  });

  it('should handle zero and negative numbers', () => {
    expect(roundNumberToDecimalPlaces(0.12345, 3)).toBe(0.123);
    expect(roundNumberToDecimalPlaces(-1.2346, 3)).toBe(-1.235);
    expect(roundNumberToDecimalPlaces(-1.2344, 3)).toBe(-1.234);
  });
});
