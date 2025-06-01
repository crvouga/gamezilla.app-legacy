import { Posix } from '~/@/time/posix'
import { BackendInstanceId } from './backend-instance-id'
import { s } from '~/@/schema'
import { TimeSpan } from '~/@/time/time-span'

const schema = s.obj({
  backendInstanceId: BackendInstanceId,
  startedAt: Posix,
  stoppedAt: s.maybe(Posix),
  lastHeartbeatAt: Posix,
  ipAddress: s.maybe(s.str()),
  port: s.maybe(s.num()),
})

export type BackendInstance = s.Infer<typeof schema>

const HEARTBEAT = TimeSpan.seconds(60)

const random = (overrides?: Partial<BackendInstance>): BackendInstance => {
  return {
    backendInstanceId: BackendInstanceId.generate(),
    startedAt: Posix.now(),
    stoppedAt: null,
    lastHeartbeatAt: Posix.now(),
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
