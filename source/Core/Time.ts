import * as Rx from "rxjs"
import * as Sub from "./Sub"
import * as Task from "./Task"

export const now = (): Task.Task<number> => {
  return async () => new Date().getTime()
}

//
//
//
// why?: https://github.com/gcanti/elm-ts/issues/20
//
//
//

export type Time = number

let intervals: { [interval: number]: Rx.Subject<number> } = {}

const cleanup = () => {
  const subs = Object.values(intervals)

  for (const sub of subs) {
    sub.unsubscribe()
  }

  intervals = {}

  console.log(`[time] cleaned up ${subs.length} subs`)
}

const onTimeout = (time: number) => {
  const subj = intervals[time]

  if (subj && subj.observed) {
    subj.next(new Date().getTime())

    setTimeout(() => onTimeout(time), time)

    return
  }

  delete intervals[time]
}

export const every = <Msg>(
  time: number,
  f: (time: Time) => Msg,
): Sub.Sub<Msg> => {
  let subj = intervals[time]

  if (subj === undefined) {
    intervals[time] = subj = new Rx.Subject<number>()

    setTimeout(() => onTimeout(time), time)
  }

  const ret = subj.pipe(Rx.map(() => f(new Date().getTime())))

  return ret
}

//
//
//
// HMR
//
//

if (import.meta.hot) {
  // import.meta.hot.accept()
  // import.meta.hot.dispose(() => {
  //   cleanup()
  // })
}
