export type Num = {
  Num: "Num";
  _value: number;
};

const wrap = (number: number): Num => {
  return {
    Num: "Num",
    _value: number,
  };
};

const unwrap = (num: Num): number => {
  return num._value;
};

const eq = (a: Num, b: Num): boolean => {
  return a._value === b._value;
};

const gt = (a: Num, b: Num): boolean => {
  return a._value > b._value;
};

const lt = (a: Num, b: Num): boolean => {
  return a._value < b._value;
};

const gte = (a: Num, b: Num): boolean => {
  return a._value >= b._value;
};

const lte = (a: Num, b: Num): boolean => {
  return a._value <= b._value;
};

export const Num = {
  init: wrap,
  eq,
  gt,
  lt,
  gte,
  lte,
  wrap,
  unwrap,
};
