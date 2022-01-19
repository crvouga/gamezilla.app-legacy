export type Integer = number & { type: "Integer" };

const floor = (x: number): Integer => {
  return Math.floor(x) as Integer;
};

export const add = (a: Integer, b: Integer): Integer => {
  return floor(a + b);
};

export const random = (lower: Integer, upper: Integer): Integer => {
  return floor(Math.random() * (upper - lower) + lower);
};

export const range = (lower: Integer, upper: Integer): Array<Integer> => {
  if (lower >= upper) {
    return [];
  }

  return [lower, ...range(floor(lower + 1), upper)];
};
