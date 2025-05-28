// https://en.wikipedia.org/wiki/Lamport_timestamp

import { s } from '~/@/schema'
import { LamportTimestamp } from './lamport-timestamp'

const schema = s.obj({
  _currentTime: LamportTimestamp,
})

export type LamportClock = s.Infer<typeof schema>

const init: LamportClock = {
  _currentTime: LamportTimestamp.fromNumber(0),
}

const initFromTimestamp = (timestamp: LamportTimestamp): LamportClock => {
  return {
    _currentTime: timestamp,
  }
}

const increment = (clock: LamportClock): LamportClock => {
  return {
    _currentTime: LamportTimestamp.increment(clock._currentTime),
  }
}

const update = (clock: LamportClock, otherClock: LamportClock): LamportClock => {
  return {
    _currentTime: LamportTimestamp.increment(LamportTimestamp.max(clock._currentTime, otherClock._currentTime)),
  }
}

const toCurrentTime = (clock: LamportClock): LamportTimestamp => {
  return clock._currentTime
}

const toNumber = (clock: LamportClock): number => {
  return LamportTimestamp.toNumber(toCurrentTime(clock))
}

const is = (_x: unknown): _x is LamportClock => {
  return false
}

export const LamportClock = {
  ...schema,
  init,
  is,
  increment,
  update,
  toCurrentTime,
  toNumber,
  initFromTimestamp,
}
