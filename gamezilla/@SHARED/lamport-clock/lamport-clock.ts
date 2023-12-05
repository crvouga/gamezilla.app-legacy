// https://en.wikipedia.org/wiki/Lamport_timestamp

export type LamportClock = {
  _timestamp: number;
};

const init = (): LamportClock => {
  return {
    _timestamp: 0,
  };
};

const increment = (clock: LamportClock): LamportClock => {
  return {
    _timestamp: clock._timestamp + 1,
  };
};

const update = (
  clock: LamportClock,
  otherClock: LamportClock
): LamportClock => {
  return {
    _timestamp: Math.max(clock._timestamp, otherClock._timestamp) + 1,
  };
};

const toTimestamp = (clock: LamportClock): number => {
  return clock._timestamp;
};


export const LamportClock = {
  init,
  increment,
  update,
  toTimestamp,
};
