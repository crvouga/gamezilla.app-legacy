// https://en.wikipedia.org/wiki/Lamport_timestamp

import { LamportTimestamp } from "./lamport-timestamp";

export type LamportClock = {
  _timestamp: LamportTimestamp;
};

const init = (): LamportClock => {
  return {
    _timestamp: LamportTimestamp.fromNumber(0),
  };
};

const increment = (clock: LamportClock): LamportClock => {
  return {
    _timestamp: LamportTimestamp.increment(clock._timestamp),
  };
};

const update = (
  clock: LamportClock,
  otherClock: LamportClock
): LamportClock => {
  return {
    _timestamp: LamportTimestamp.increment(
      LamportTimestamp.max(clock._timestamp, otherClock._timestamp)
    ),
  };
};

const toNumber = (clock: LamportClock): number => {
  return LamportTimestamp.toNumber(clock._timestamp);
};

export const LamportClock = {
  init,
  increment,
  update,
  toNumber,
};
