import { Sub } from '../program/sub'
import { Posix } from '../time/posix'

export type RuntimeEvent = {
  t: 'stopping'
  stoppedAt: Posix
}

export type IRuntime = {
  events: Sub<RuntimeEvent>
}
