import { Sub } from '../sub'
import { Posix } from '../time/posix'

export type RuntimeEvent =
  | {
      t: 'runtime/stopping'
      stoppedAt: Posix
    }
  | {
      t: 'runtime/other'
    }

export type IRuntime = {
  events: Sub<RuntimeEvent>
}
