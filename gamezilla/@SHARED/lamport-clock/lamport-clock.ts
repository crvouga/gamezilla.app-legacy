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

const toTimestamp = (clock: LamportClock): LamportTimestamp => {
  return clock._timestamp;
};

const toNumber = (clock: LamportClock): number => {
  return LamportTimestamp.toNumber(toTimestamp(clock))
};

export const LamportClock = {
  init,
  increment,
  update,
  toTimestamp,
  toNumber,
};
