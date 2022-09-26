import * as Rx from "rxjs"
import * as Cmd from "./Cmd"
import * as Sub from "./Sub"
import * as Task from "./Task"

export const now = (): Task.Task<number> => {
  return async () => new Date().getTime()
}

export const delay =
  <TMsg>(timeout: number, msg: TMsg): Task.Task<TMsg> =>
    async () => {
      await new Promise((resolve) => setTimeout(resolve, timeout))
      return msg
    }

//
//
//
// Timeout
//
//
//

const timeouts = new Map<string, string>()


export const startTimeout = <Msg>(
  timeoutId: string,
  duration: number,
  msg: Msg,
): Cmd.Cmd<Msg> => {
  return (dispatch) => {

    timeouts.set(timeoutId, timeoutId)

    setTimeout(() => {
      if (timeouts.has(timeoutId)) {
        dispatch(msg)
      }

      timeouts.delete(timeoutId)
    }, duration)
  }
}

export const cancelTimeout = (timeoutId: string): Cmd.Cmd<never> => {
  return () => {
    timeouts.delete(timeoutId)
  }
}

//
//
//
// why not just use rxjs for intervals?
// https://github.com/gcanti/elm-ts/issues/20
//
//
//

// NOTE: needs to be cleaned up when using HMR
const intervals = new Map<string, Rx.Subject<number>>()

const onTimeout = (intervalId: string, time: number) => {
  const subj = intervals.get(intervalId)

  if (subj && subj.observed) {
    subj.next(new Date().getTime())

    setTimeout(() => onTimeout(intervalId, time), time)

    return
  }

  intervals.delete(intervalId)
}

export const every = <Msg>(
  intervalId: string,
  time: number,
  f: (time: number) => Msg,
): Sub.Sub<Msg> => {
  const subj = intervals.get(intervalId)

  if (subj) {
    return subj.pipe(Rx.map(() => f(new Date().getTime())))
  }

  const newSubj = new Rx.Subject<number>()

  intervals.set(intervalId, newSubj)

  setTimeout(() => {
    onTimeout(intervalId, time)
  }, time)

  return newSubj.pipe(Rx.map(() => f(new Date().getTime())))
}

