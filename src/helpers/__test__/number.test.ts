import { isPointInRect, roundNumberToDecimalPlaces } from '../number';

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

describe('isPointInRect', () => {
  it('should return true if the point is inside the rect', () => {
    expect(
      isPointInRect({ x: 1, y: 1 }, { x: 0, y: 0, width: 2, height: 2 })
    ).toBe(true);
  });
  it('should return false if the point is outside the rect', () => {
    expect(
      isPointInRect({ x: 3, y: 3 }, { x: 0, y: 0, width: 2, height: 2 })
    ).toBe(false);
    expect(
      isPointInRect({ x: -1, y: 0 }, { x: 0, y: 0, width: 2, height: 2 })
    ).toBe(false);
    expect(
      isPointInRect({ x: 1, y: 3 }, { x: 0, y: 0, width: 2, height: 2 })
    ).toBe(false);
    expect(
      isPointInRect({ x: 1, y: -3 }, { x: 0, y: 0, width: 2, height: 2 })
    ).toBe(false);
  });
  it('should return false if the point is on the edge of the rect', () => {
    expect(
      isPointInRect({ x: 2, y: 2 }, { x: 0, y: 0, width: 2, height: 2 })
    ).toBe(true);
  });
});
