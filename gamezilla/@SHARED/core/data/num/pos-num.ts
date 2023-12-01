/**
 * Represents a number that will always be positive
 */
export type PosNum = {
  _type: "PosNum";
  _value: number;
};

const init = (number: number): PosNum => {
  const value = Math.max(0, number);

  return {
    _type: "PosNum",
    _value: value,
  };
};

const add = (a: PosNum, b: PosNum): PosNum => {
  return init(a._value + b._value);
};

const sub = (a: PosNum, b: PosNum): PosNum => {
  return init(a._value - b._value);
};

const inc = (a: PosNum): PosNum => {
  return add(a, init(1));
};

export const PosNum = {
  sub,
  add,
  init,
  inc,
};
