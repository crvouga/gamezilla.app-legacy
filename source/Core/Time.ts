import * as Rx from "rxjs"
import * as Sub from "./Sub"
import * as Option from "./Option"
import * as Cmd from "./Cmd"
import * as Task from "./Task"
import { pipe } from "./pipe"

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

const __timeouts: { [timeoutId: string]: string } = {}

export const startTimeout = <Msg>(
  timeoutId: string,
  duration: number,
  msg: Msg,
): Cmd.Cmd<Msg> => {
  return Rx.of(async () => {
    await new Promise((resolve) => {
      __timeouts[timeoutId] = timeoutId
      setTimeout(resolve, duration)
    })

    if (__timeouts[timeoutId]) {
      return Option.Some(msg)
    }

    // memory clean up
    delete __timeouts[timeoutId]

    return Option.None
  })
}

export const cancelTimeout = (timeoutId: string): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    delete __timeouts[timeoutId]
    return Option.None
  })
}

//
//
//
// why not use rxjs for intervals?: https://github.com/gcanti/elm-ts/issues/20
//
//
//

// NOTE: needs to be cleaned up when using HMR
let __intervals: { [interval: number]: Rx.Subject<number> } = {}

export type Time = number

const onTimeout = (time: number) => {
  const subj = __intervals[time]

  if (subj && subj.observed) {
    subj.next(new Date().getTime())

    setTimeout(() => onTimeout(time), time)

    return
  }

  delete __intervals[time]
}

export const every = <Msg>(
  time: number,
  f: (time: Time) => Msg,
): Sub.Sub<Msg> => {
  let subj = __intervals[time]

  if (subj === undefined) {
    __intervals[time] = subj = new Rx.Subject<number>()

    setTimeout(() => onTimeout(time), time)
  }

  return subj.pipe(Rx.map(() => f(new Date().getTime())))
}
