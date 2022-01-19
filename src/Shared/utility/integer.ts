export type IInteger = number & { type: "Integer" };

const floor = (x: number): IInteger => {
  return Math.floor(x) as IInteger;
};

const add = (a: IInteger, b: IInteger): IInteger => {
  return floor(a + b);
};

const random = (lower: IInteger, upper: IInteger): IInteger => {
  return floor(Math.random() * (upper - lower) + lower);
};

const range = (lower: IInteger, upper: IInteger): Array<IInteger> => {
  if (lower >= upper) {
    return [];
  }

  return [lower, ...range(floor(lower + 1), upper)];
};

export default {
  range,
  floor,
  add,
  random,
};
