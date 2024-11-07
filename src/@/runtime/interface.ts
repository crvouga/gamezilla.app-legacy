import { Posix, Sub } from '../core'

export type RuntimeEvent = {
  t: 'stopping'
  stoppedAt: Posix
}

export type IRuntime = {
  events: Sub<RuntimeEvent>
}
