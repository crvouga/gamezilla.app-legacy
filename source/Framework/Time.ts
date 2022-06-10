/**
 * Exposes some utilities to work with unix time.
 *
 * See [Time](https://package.elm-lang.org/packages/elm/time/latest/Time) Elm package.
 *
 * @since 0.5.0
 */

import { Task } from "fp-ts/lib/Task";
import * as Rx from "rxjs";

import { Sub } from "./Sub";

/**
 * Get the current unix time as a `Task`.
 * @category constructors
 * @since 0.5.0
 */
export function now(): Task<number> {
  return () => Promise.resolve(new Date().getTime());
}

//
//
//
// why?: https://github.com/gcanti/elm-ts/issues/20
//
//
//

export type Time = number;

const intervals: { [interval: number]: Rx.Subject<number> } = {};

const onTimeout = (time: number) => {
  const subj = intervals[time];

  if (subj && subj.observed) {
    subj.next(new Date().getTime());
    setTimeout(() => onTimeout(time), time);

    return;
  }

  delete intervals[time];
};

export const every = <Msg>(time: number, f: (time: Time) => Msg): Sub<Msg> => {
  let subj = intervals[time];

  if (subj === undefined) {
    intervals[time] = subj = new Rx.Subject<number>();

    setTimeout(() => onTimeout(time), time);
  }

  return subj.pipe(Rx.map(() => f(new Date().getTime())));
};
