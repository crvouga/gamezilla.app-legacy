export type TimeSpan = {
  type: "TimeSpan";
  _durationMilliseconds: number;
};

const fromMilliseconds = (durationMilliseconds: number): TimeSpan => {
  return {
    type: "TimeSpan",
    _durationMilliseconds: durationMilliseconds,
  };
};

const fromSeconds = (durationSeconds: number): TimeSpan => {
  return fromMilliseconds(durationSeconds * 1000);
};

const fromMinutes = (durationMinutes: number): TimeSpan => {
  return fromSeconds(durationMinutes * 60);
};

const fromHours = (durationHours: number): TimeSpan => {
  return fromMinutes(durationHours * 60);
};

const fromDays = (durationDays: number): TimeSpan => {
  return fromHours(durationDays * 24);
};

const fromWeeks = (durationWeeks: number): TimeSpan => {
  return fromDays(durationWeeks * 7);
};

const fromMonths = (durationMonths: number): TimeSpan => {
  return fromWeeks(durationMonths * 4);
};

const fromYears = (durationYears: number): TimeSpan => {
  return fromMonths(durationYears * 12);
};

const toMilliseconds = (timeSpan: TimeSpan): number => {
  return timeSpan._durationMilliseconds;
};

const toSeconds = (timeSpan: TimeSpan): number => {
  return toMilliseconds(timeSpan) / 1000;
};

const toMinutes = (timeSpan: TimeSpan): number => {
  return toSeconds(timeSpan) / 60;
};

const toHours = (timeSpan: TimeSpan): number => {
  return toMinutes(timeSpan) / 60;
};

const toDays = (timeSpan: TimeSpan): number => {
  return toHours(timeSpan) / 24;
};

const toWeeks = (timeSpan: TimeSpan): number => {
  return toDays(timeSpan) / 7;
};

const toMonths = (timeSpan: TimeSpan): number => {
  return toWeeks(timeSpan) / 4;
};

const toYears = (timeSpan: TimeSpan): number => {
  return toMonths(timeSpan) / 12;
};

const add = (left: TimeSpan, right: TimeSpan): TimeSpan => {
  return fromMilliseconds(toMilliseconds(left) + toMilliseconds(right));
};

const subtract = (left: TimeSpan, right: TimeSpan): TimeSpan => {
  return fromMilliseconds(toMilliseconds(left) - toMilliseconds(right));
};

const scale = (timeSpan: TimeSpan, factor: number): TimeSpan => {
  return fromMilliseconds(toMilliseconds(timeSpan) * factor);
};

const encodingKey = "TimeSpan";
const delimiter = ":";
const encode = (timeSpan: TimeSpan): string => {
  return [encodingKey, delimiter, timeSpan._durationMilliseconds].join("");
};

const decode = (encoded: string): TimeSpan | null => {
  const [key, value] = encoded.split(delimiter);
  if (typeof key !== "string") {
    return null;
  }
  if (typeof value !== "string") {
    return null;
  }
  if (key !== encodingKey) {
    return null;
  }
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return null;
  }
  return {
    type: "TimeSpan",
    _durationMilliseconds: parsed,
  };
};

const eq = (left: TimeSpan, right: TimeSpan): boolean => {
  return toMilliseconds(left) === toMilliseconds(right);
};

const gt = (left: TimeSpan, right: TimeSpan): boolean => {
  return toMilliseconds(left) > toMilliseconds(right);
};

const lt = (left: TimeSpan, right: TimeSpan): boolean => {
  return toMilliseconds(left) < toMilliseconds(right);
};

const gte = (left: TimeSpan, right: TimeSpan): boolean => {
  return toMilliseconds(left) >= toMilliseconds(right);
};

const lte = (left: TimeSpan, right: TimeSpan): boolean => {
  return toMilliseconds(left) <= toMilliseconds(right);
};

/**
 * @description
 * `TimeSpan` represents a duration of time.
 */
export const TimeSpan = {
  //
  //
  //
  fromMilliseconds,
  fromSeconds,
  fromMinutes,
  fromHours,
  fromDays,
  fromWeeks,
  fromMonths,
  fromYears,
  //
  //
  //
  toMilliseconds,
  toSeconds,
  toMinutes,
  toHours,
  toDays,
  toYears,
  //
  //
  //
  add,
  subtract,
  scale,
  //
  //
  //
  eq,
  gt,
  lt,
  gte,
  lte,
  //
  //
  //
  encode,
  decode,
};
