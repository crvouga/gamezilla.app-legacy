import { Eff } from "./eff";
import { p } from "./pipe";
import { PubSub, Sub } from "./sub";
import { Task } from "./task";

export type Posix = number & { _tag: "Posix" };

export const Posix = {
  is: (posixTime: unknown): posixTime is Posix => {
    if (typeof posixTime !== "number") {
      return false;
    }

    const minPosixTime = new Date("1970-01-01T00:00:00.000Z").getTime();
    const maxPosixTime = new Date("2038-01-19T03:14:07.999Z").getTime();
    if (posixTime < minPosixTime || posixTime > maxPosixTime) {
      return false;
    }

    return true;
  },
};

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

export const cancelTimeout = (timeoutId: string): Eff => {
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

const intervals = new Map<string, PubSub<number>>();

const onTimeout = (intervalId: string, time: number) => {
  const sub = intervals.get(intervalId);

  if (sub && sub.isSubscribed()) {
    sub.publish(new Date().getTime());

    setTimeout(() => onTimeout(intervalId, time), time);

    return;
  }

  intervals.delete(intervalId);
};

export const every = <Msg>(
  intervalId: string,
  time: number,
  f: (time: number) => Msg
): Sub<Msg> => {
  const sub = intervals.get(intervalId);

  if (sub) {
    return Sub.map(sub, () => f(Date.now()));
  }

  const subNew = PubSub.create<number>();

  intervals.set(intervalId, subNew);

  setTimeout(() => {
    onTimeout(intervalId, time);
  }, time);

  return {
    subscribe: (subscriber) => {
      return subNew.subscribe((msg) => {
        subscriber(f(msg));
      });
    },
  };
};
