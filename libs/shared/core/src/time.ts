import * as Rx from 'rxjs';
import { Cmd } from './cmd';
import { Sub } from './sub';
import { Task } from './task';

export type Posix = number & { _tag: 'Posix' };

export const Posix = {
  is: (posixTime: unknown): posixTime is Posix => {
    if (typeof posixTime !== 'number') {
      return false;
    }

    const minPosixTime = new Date('1970-01-01T00:00:00.000Z').getTime();
    const maxPosixTime = new Date('2038-01-19T03:14:07.999Z').getTime();
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
): Cmd<Msg> => {
  return ($send) => {
    timeouts.set(timeoutId, timeoutId);

    setTimeout(() => {
      if (timeouts.has(timeoutId)) {
        $send(msg);
      }

      timeouts.delete(timeoutId);
    }, duration);
  };
};

export const cancelTimeout = (timeoutId: string): Cmd => {
  return () => {
    timeouts.delete(timeoutId);
  };
};

//
//
//
// why not just use rxjs for intervals?
// https://github.com/gcanti/elm-ts/issues/20
//
//
//

// NOTE: needs to be cleaned up when using HMR
const intervals = new Map<string, Rx.Subject<number>>();

const onTimeout = (intervalId: string, time: number) => {
  const subj = intervals.get(intervalId);

  if (subj && subj.observed) {
    subj.next(new Date().getTime());

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
  const subj = intervals.get(intervalId);

  if (subj) {
    return subj.pipe(Rx.map(() => f(new Date().getTime())));
  }

  const newSubj = new Rx.Subject<number>();

  intervals.set(intervalId, newSubj);

  setTimeout(() => {
    onTimeout(intervalId, time);
  }, time);

  return newSubj.pipe(Rx.map(() => f(new Date().getTime())));
};
