import { Posix } from "./data";
import { TimeSpan } from "./data/time-span";
import { Eff } from "./eff";
import { PubSub, Sub } from "./sub";
import { Task } from "./task";

//
//
//
//
//
//
//

const delay =
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

const startTimeout = <Msg>(
  timeoutId: string | number,
  duration: TimeSpan,
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
    }, TimeSpan.toMilliseconds(duration));
  };
};

const cancelTimeout = (timeoutId: string | number): Eff => {
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
    sub.publish(Posix.now$());

    setTimeout(
      () => onTimeout(intervalId, timeSpan),
      TimeSpan.toMilliseconds(timeSpan)
    );

    return;
  }

  intervals.delete(intervalId);
};

const interval = <Msg>(
  intervalId: string,
  timeSpan: TimeSpan,
  f: (now: Posix) => Msg
): Sub<Msg> => {
  const sub = intervals.get(intervalId);

  if (sub) {
    return Sub.map(sub, () => f(Posix.now$()));
  }

  const subNew = PubSub.create<Posix>();

  intervals.set(intervalId, subNew);

  console.log("interval started", intervalId, intervals)

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

export const Time = {
  delay,
  startTimeout,
  cancelTimeout,
  interval,
};
