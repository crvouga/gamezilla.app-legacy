import type { Eff } from '../eff'
import { PubSub, Sub } from '../sub'
import { UnixMs } from './posix'
import { TimeSpan } from './time-span'

//
//
//
// Timeout
//
//
//

const timeouts = new Map<string | number, string | number>()

const startTimeout = <Msg>(timeoutId: string | number, duration: TimeSpan, msg: Msg): Eff<Msg> => {
  return (dispatch) => {
    timeouts.set(timeoutId, timeoutId)

    setTimeout(() => {
      if (timeouts.has(timeoutId)) {
        dispatch(msg)
        timeouts.delete(timeoutId)
        return
      }

      timeouts.delete(timeoutId)
    }, TimeSpan.toMilliseconds(duration))
  }
}

const cancelTimeout = (timeoutId: string | number): Eff => {
  return () => {
    timeouts.delete(timeoutId)
  }
}

//
//
//
// Interval
//
//
//

const intervals = new Map<string, PubSub<UnixMs>>()

const toIntervalKey = (intervalId: string, _timeSpan: TimeSpan) => {
  return intervalId
  // return `${intervalId}-${TimeSpan.toMilliseconds(timeSpan)}`
}

const onTimeout = (intervalId: string, timeSpan: TimeSpan) => {
  const key = toIntervalKey(intervalId, timeSpan)

  const sub = intervals.get(key)

  if (sub && sub.subscriberCount() > 0) {
    sub.pub(UnixMs.now())

    setTimeout(() => {
      onTimeout(intervalId, timeSpan)
    }, TimeSpan.toMilliseconds(timeSpan))

    return
  }

  intervals.delete(intervalId)
}

const interval = <Msg>(intervalId: string, timeSpan: TimeSpan, f: (now: UnixMs) => Msg): Sub<Msg> => {
  const key = toIntervalKey(intervalId, timeSpan)

  const sub = intervals.get(key)

  if (sub) {
    return Sub.map(sub, () => f(UnixMs.now()))
  }

  const subNew = Sub.create<UnixMs>()

  intervals.set(key, subNew)

  setTimeout(() => {
    onTimeout(intervalId, timeSpan)
  }, TimeSpan.toMilliseconds(timeSpan))

  return Sub.map(subNew, f)
}

export const Time = {
  startTimeout,
  cancelTimeout,
  interval,
}
