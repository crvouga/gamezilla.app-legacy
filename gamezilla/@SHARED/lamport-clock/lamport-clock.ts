// https://en.wikipedia.org/wiki/Lamport_timestamp

import { LamportTimestamp } from "./lamport-timestamp";

export type LamportClock = {
  _currentTime: LamportTimestamp;
};

const init: LamportClock = {
  _currentTime: LamportTimestamp.fromNumber(0),
};

const increment = (clock: LamportClock): LamportClock => {
  return {
    _currentTime: LamportTimestamp.increment(clock._currentTime),
  };
};

const update = (
  clock: LamportClock,
  otherClock: LamportClock
): LamportClock => {
  return {
    _currentTime: LamportTimestamp.increment(
      LamportTimestamp.max(clock._currentTime, otherClock._currentTime)
    ),
  };
};

const toCurrentTime = (clock: LamportClock): LamportTimestamp => {
  return clock._currentTime;
};

const toNumber = (clock: LamportClock): number => {
  return LamportTimestamp.toNumber(toCurrentTime(clock));
};

export const LamportClock = {
  init,
  increment,
  update,
  toCurrentTime,
  toNumber,
};
