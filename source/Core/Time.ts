import * as Rx from "rxjs"
import * as HMR from "./HMR"
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

const intervals = HMR.getData(
  "intervals",
  (): { [interval: number]: Rx.Subject<number> } => ({}),
)

const onTimeout = (time: number) => {
  const subj = intervals[time]

  if (subj && subj.observed) {
    subj.next(new Date().getTime())
    setTimeout(() => onTimeout(time), time)

    HMR.setData("intervals", intervals)
    return
  }

  delete intervals[time]

  HMR.setData("intervals", intervals)
}

export const every = <Msg>(
  time: number,
  f: (time: Time) => Msg,
): Sub.Sub<Msg> => {
  let subj = intervals[time]

  if (subj === undefined) {
    intervals[time] = subj = new Rx.Subject<number>()
    HMR.setData("intervals", intervals)

    setTimeout(() => onTimeout(time), time)
  }

  const ret = subj.pipe(Rx.map(() => f(new Date().getTime())))

  HMR.setData("intervals", intervals)

  return ret
}
