import type { Eff } from '../core/eff'
import { PubSub, Sub } from '../core/sub'
import { Posix } from './posix'
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

const intervals = new Map<string, PubSub<Posix>>()

const onTimeout = (intervalId: string, timeSpan: TimeSpan) => {
  const sub = intervals.get(intervalId)

  if (sub?.isSubbed()) {
    sub.pub(Posix.now())

    setTimeout(() => {
      onTimeout(intervalId, timeSpan)
    }, TimeSpan.toMilliseconds(timeSpan))

    return
  }

  intervals.delete(intervalId)
}

const interval = <Msg>(intervalId: string, timeSpan: TimeSpan, f: (now: Posix) => Msg): Sub<Msg> => {
  const sub = intervals.get(intervalId)

  if (sub) {
    return Sub.map(sub, () => f(Posix.now()))
  }

  const subNew = PubSub.create<Posix>()

  intervals.set(intervalId, subNew)

  setTimeout(() => {
    onTimeout(intervalId, timeSpan)
  }, TimeSpan.toMilliseconds(timeSpan))

  return {
    sub(subscriber) {
      const unsub = subNew.sub((msg) => {
        subscriber(f(msg))
      })
      return () => {
        unsub()
      }
    }
  }
}

export const Time = {
  startTimeout,
  cancelTimeout,
  interval
}
