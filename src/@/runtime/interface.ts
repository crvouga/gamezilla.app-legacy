import { Sub } from '../sub'
import { UnixMs } from '../time/posix'

export type RuntimeEvent =
  | {
      t: 'runtime/stopping'
      stoppedAt: UnixMs
    }
  | {
      t: 'runtime/other'
    }

export type IRuntime = {
  events: Sub<RuntimeEvent>
}
