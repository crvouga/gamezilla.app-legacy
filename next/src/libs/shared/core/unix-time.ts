export type Posix = number & { Posix: 'Posix' };

const minPosixTime = new Date('1970-01-01T00:00:00.000Z').getTime();
const maxPosixTime = new Date('2038-01-19T03:14:07.999Z').getTime();

const is = (posixTime: unknown): posixTime is Posix => {
  if (typeof posixTime !== 'number') {
    return false;
  }

  if (posixTime < minPosixTime || posixTime > maxPosixTime) {
    return false;
  }

  return true;
};

const fromNumber = (posixTime: number): Posix => {
  const clamped = Math.min(Math.max(posixTime, minPosixTime), maxPosixTime);
  if (is(clamped)) {
    return clamped;
  }
  throw new Error('impossible condition. failed to clamp posix time');
};

const toNumber = (posixTime: Posix): number => {
  return posixTime;
};

export const Posix = {
  is,
  fromNumber,
  toNumber,
};
