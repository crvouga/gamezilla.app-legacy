import { Posix } from '~/@/time/posix'
import { BackendInstanceId } from './backend-instance-id'
import { p } from '~/@/schema'
import { TimeSpan } from '~/@/time/time-span'

const parser = p.obj({
  backendInstanceId: BackendInstanceId,
  startedAt: Posix,
  stoppedAt: p.maybe(Posix),
  lastHeartbeatAt: Posix,
  ipAddress: p.maybe(p.str),
  port: p.maybe(p.num),
})

export type BackendInstance = p.Infer<typeof parser>

const HEARTBEAT = TimeSpan.minutes(1)

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
  ...parser,
  HEARTBEAT,
  random,
}
