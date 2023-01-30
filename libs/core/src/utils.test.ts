import { rescale } from './utils';

describe('utils', () => {
  it('rescales', () => {
    const actual = rescale({ value: 10, from: [0, 100], to: [0, 10] });
    const expected = 1;
    expect(actual).toEqual(expected);
  });

  it('rescale inverse', () => {
    const actual = rescale({ value: 10, from: [0, 100], to: [10, 0] });
    const expected = 9;
    expect(actual).toEqual(expected);
  });
});
