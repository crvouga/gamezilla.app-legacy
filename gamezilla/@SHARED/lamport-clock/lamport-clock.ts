// https://en.wikipedia.org/wiki/Lamport_timestamp

type LamportClock = {
  counter: number;
};

const init = (): LamportClock => {
  return {
    counter: 0,
  };
};

const increment = (clock: LamportClock): LamportClock => {
  return {
    counter: clock.counter + 1,
  };
};

const update = (
  clock: LamportClock,
  otherClock: LamportClock
): LamportClock => {
  return {
    counter: Math.max(clock.counter, otherClock.counter) + 1,
  };
};

const toTimestamp = (clock: LamportClock): number => {
  return clock.counter;
};


export const LamportClock = {
  init,
  increment,
  update,
  toTimestamp,
};
