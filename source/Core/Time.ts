import * as Rx from "rxjs"
import * as Sub from "./Sub"
import * as Task from "./Task"

export const now = (): Task.Task<number> => {
  return async () => new Date().getTime()
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

const cleanupIntervals = () => {
  const subs = Object.values(__intervals)

  for (const sub of subs) {
    sub.unsubscribe()
  }

  __intervals = {}

  console.log(`[time] cleaned up ${subs.length} subs`)
}

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

  const ret = subj.pipe(Rx.map(() => f(new Date().getTime())))

  return ret
}
