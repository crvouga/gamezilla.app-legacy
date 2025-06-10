import { Sub } from '../sub'
import { UnixMs } from '../time/unix-ms'

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
