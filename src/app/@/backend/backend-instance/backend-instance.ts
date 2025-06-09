import { UnixMs } from '~/@/time/posix'
import { BackendInstanceId } from './backend-instance-id'
import { s } from '~/@/schema'
import { TimeSpan } from '~/@/time/time-span'

const schema = s.obj({
  backendInstanceId: BackendInstanceId,
  startedAt: UnixMs,
  stoppedAt: s.maybe(UnixMs),
  lastHeartbeatAt: UnixMs,
  ipAddress: s.maybe(s.str()),
  port: s.maybe(s.num()),
})

export type BackendInstance = s.Infer<typeof schema>

const HEARTBEAT = TimeSpan.seconds(60)

const random = (overrides?: Partial<BackendInstance>): BackendInstance => {
  return {
    backendInstanceId: BackendInstanceId.generate(),
    startedAt: UnixMs.now(),
    stoppedAt: null,
    lastHeartbeatAt: UnixMs.now(),
    ipAddress: null,
    port: null,
    ...overrides,
  }
}

export const BackendInstance = {
  ...schema,
  HEARTBEAT,
  random,
}
