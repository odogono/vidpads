import { formatTimeToString } from '../time';

describe('formatTimeToString', () => {
  test('formats zero correctly', () => {
    expect(formatTimeToString(0)).toBe('00:00:000');
  });

  test('formats positive whole seconds correctly', () => {
    expect(formatTimeToString(61)).toBe('01:01:000');
    expect(formatTimeToString(120)).toBe('02:00:000');
  });

  test('formats negative times correctly', () => {
    expect(formatTimeToString(-61)).toBe('-01:01:000');
    expect(formatTimeToString(-120)).toBe('-02:00:000');
  });

  test('formats milliseconds correctly', () => {
    expect(formatTimeToString(1.5)).toBe('00:01:500');
    expect(formatTimeToString(61.123)).toBe('01:01:123');
    expect(formatTimeToString(-1.5)).toBe('-00:01:500');
  });

  test('handles large minute values', () => {
    expect(formatTimeToString(3600)).toBe('60:00:000');
    expect(formatTimeToString(7200)).toBe('120:00:000');
  });

  test('handles very small millisecond values', () => {
    expect(formatTimeToString(0.001)).toBe('00:00:001');
    expect(formatTimeToString(-0.001)).toBe('-00:00:001');
  });
});
