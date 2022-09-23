import * as Rx from "rxjs"
import * as Cmd from "./Cmd"
import * as Option from "./Option"
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
// why not use rxjs for intervals?: https://github.com/gcanti/elm-ts/issues/20
//
//
//

// NOTE: needs to be cleaned up when using HMR
let __intervals: { [intervalId: string]: Rx.Subject<number> } = {}

const onTimeout = (intervalId: string, time: number) => {
  const subj = __intervals[intervalId]

  if (subj && subj.observed) {
    subj.next(new Date().getTime())

    setTimeout(() => onTimeout(intervalId, time), time)

    return
  }

  delete __intervals[intervalId]
}

export const every = <Msg>(
  intervalId: string,
  time: number,
  f: (time: number) => Msg,
): Sub.Sub<Msg> => {
  let subj = __intervals[intervalId]

  if (subj === undefined) {
    __intervals[intervalId] = subj = new Rx.Subject<number>()

    setTimeout(() => onTimeout(intervalId, time), time)
  }

  return subj.pipe(Rx.map(() => f(new Date().getTime())))
}

//
//
//
//
//
//

export type Seconds = number & { _type: "Seconds" }

export const isSeconds = (seconds: unknown): seconds is Seconds => {
  return typeof seconds === "number"
}
