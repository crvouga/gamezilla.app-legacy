export type INaturalNumber = number & { NaturalNumber: true };

const floor = (x: number): INaturalNumber => {
  return Math.max(1, Math.floor(x)) as INaturalNumber;
};

const add = (a: INaturalNumber, b: INaturalNumber): INaturalNumber => {
  return floor(a + b);
};

const random = (
  lower: INaturalNumber,
  upper: INaturalNumber
): INaturalNumber => {
  return floor(Math.random() * (upper - lower) + lower);
};

const increment = (x: INaturalNumber): INaturalNumber => {
  return floor(x + 1);
};

const range = (
  lower: INaturalNumber,
  upper: INaturalNumber
): Array<INaturalNumber> => {
  if (lower >= upper) {
    return [];
  }

  return [lower, ...range(increment(lower), upper)];
};

export const NaturalNumber = {
  range,
  floor,
  add,
  random,
  increment,
};
