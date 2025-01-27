import { formatTimeToString, hexToSeconds, secondsToHex } from '../time';

describe('formatTimeToString', () => {
  test('formats zero correctly', () => {
    expect(formatTimeToString(0)).toBe('000:00:000');
  });

  test('formats positive whole seconds correctly', () => {
    expect(formatTimeToString(61)).toBe('001:01:000');
    expect(formatTimeToString(120)).toBe('002:00:000');
  });

  test('formats negative times correctly', () => {
    expect(formatTimeToString(-61)).toBe('-001:01:000');
    expect(formatTimeToString(-120)).toBe('-002:00:000');
  });

  test('formats milliseconds correctly', () => {
    expect(formatTimeToString(1.5)).toBe('000:01:500');
    expect(formatTimeToString(61.123)).toBe('001:01:123');
    expect(formatTimeToString(-1.5)).toBe('-000:01:500');
  });

  test('handles large minute values', () => {
    expect(formatTimeToString(3600)).toBe('060:00:000');
    expect(formatTimeToString(7200)).toBe('120:00:000');
  });

  test('handles very small millisecond values', () => {
    expect(formatTimeToString(0.001)).toBe('000:00:001');
    expect(formatTimeToString(-0.001)).toBe('-000:00:001');
  });
});

describe('secondsToHex', () => {
  test('converts seconds to hex', () => {
    expect(secondsToHex(1)).toBe('3e8');
    expect(secondsToHex(360)).toBe('57e40');
    expect(secondsToHex(12.345)).toBe('3039');
  });
});

describe('hexToSeconds', () => {
  test('converts hex to seconds', () => {
    expect(hexToSeconds('3e8')).toBe(1);
    expect(hexToSeconds('3039')).toBe(12.345);
  });
});
