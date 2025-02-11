import { integerToPadId, padIdToInteger } from '../pad';

describe('padIdToInteger', () => {
  it('should convert padId to integer', () => {
    expect(padIdToInteger('a1')).toBe(1);
    expect(padIdToInteger('b2')).toBe(18);
  });
});

describe('integerToPadId', () => {
  it('should convert integer to padId', () => {
    expect(integerToPadId(1)).toBe('a1');
    expect(integerToPadId(18)).toBe('b2');
  });
});
