import { Eff } from "./eff";
import { PubSub, Sub } from "./sub";
import { Task } from "./task";
import { TimeSpan } from "./time-span";

export type Posix = number & { Posix: "Posix" };

const minPosixTime = new Date("1970-01-01T00:00:00.000Z").getTime();
const maxPosixTime = new Date("2038-01-19T03:14:07.999Z").getTime();

const is = (posixTime: unknown): posixTime is Posix => {
  if (typeof posixTime !== "number") {
    return false;
  }

  if (posixTime < minPosixTime || posixTime > maxPosixTime) {
    return false;
  }

  return true;
};

const fromNumber = (posixTime: number): Posix => {
  const clamped = Math.max(posixTime, minPosixTime);
  if (is(clamped)) {
    return clamped;
  }
  throw new Error("impossible condition. failed to clamp posix time");
};

const toNumber = (posixTime: Posix): number => {
  return posixTime;
};

const now = (): Posix => {
  return fromNumber(Date.now());
};

const diff = (a: Posix, b: Posix): TimeSpan => {
  return TimeSpan.fromMilliseconds(Math.abs(a - b));
};

export const Posix = {
  is,
  fromNumber,
  toNumber,
  now,
  diff,
};

//
//
//
//
//
//
//

export const delay =
  <TMsg>(timeout: number, msg?: TMsg): Task<TMsg | null> =>
  async () => {
    await new Promise((resolve) => setTimeout(resolve, timeout));
    return msg ?? null;
  };

//
//
//
// Timeout
//
//
//

const timeouts = new Map<string | number, string | number>();

export const startTimeout = <Msg>(
  timeoutId: string | number,
  duration: number,
  msg: Msg
): Eff<Msg> => {
  return (dispatch) => {
    timeouts.set(timeoutId, timeoutId);

    setTimeout(() => {
      if (timeouts.has(timeoutId)) {
        dispatch(msg);
        timeouts.delete(timeoutId);
        return;
      }

      timeouts.delete(timeoutId);
    }, duration);
  };
};

export const cancelTimeout = (timeoutId: string | number): Eff => {
  return () => {
    timeouts.delete(timeoutId);
  };
};

//
//
//
// Interval
//
//
//

const intervals = new Map<string, PubSub<Posix>>();

const onTimeout = (intervalId: string, timeSpan: TimeSpan) => {
  const sub = intervals.get(intervalId);

  if (sub && sub.isSubscribed()) {
    sub.publish(Posix.now());

    setTimeout(
      () => onTimeout(intervalId, timeSpan),
      TimeSpan.toMilliseconds(timeSpan)
    );

    return;
  }

  intervals.delete(intervalId);
};

export const interval = <Msg>(
  intervalId: string,
  timeSpan: TimeSpan,
  f: (now: Posix) => Msg
): Sub<Msg> => {
  const sub = intervals.get(intervalId);

  if (sub) {
    return Sub.map(sub, () => f(Posix.now()));
  }

  const subNew = PubSub.create<Posix>();

  intervals.set(intervalId, subNew);

  setTimeout(() => {
    onTimeout(intervalId, timeSpan);
  }, TimeSpan.toMilliseconds(timeSpan));

  return {
    subscribe: (subscriber) => {
      return subNew.subscribe((msg) => {
        subscriber(f(msg));
      });
    },
  };
};
