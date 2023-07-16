/**
 * Represents a number that will always be positive
 */
export type PosNum = number & { _opaque: "PosNum" };

const is = (number: unknown): number is PosNum => {
  return typeof number === "number" && number >= 0;
};

const fromNum = (number: number): PosNum => {
  const posNum = Math.max(0, number);

  if (is(posNum)) {
    return posNum;
  }

  throw new Error("impossible case");
};

const add = (a: PosNum, b: PosNum): PosNum => {
  return fromNum(a + b);
};

const sub = (a: PosNum, b: PosNum): PosNum => {
  return fromNum(a - b);
};

const inc = (a: PosNum): PosNum => {
  return fromNum(a + 1);
};

export const PosNum = {
  sub,
  add,
  fromNum,
  is,
  inc,
};
