import { Posix, TimeSpan } from 'gamezilla-app/@/core'
import { ServerInstanceId } from './server-instance-id'
import { p } from 'gamezilla-app/@/core/parser'

const parser = p.obj({
  serverInstanceId: ServerInstanceId,
  startedAt: Posix,
  stoppedAt: p.maybe(Posix),
  lastHeartbeatAt: Posix,
  ipAddress: p.maybe(p.str),
  port: p.maybe(p.num)
})

export type ServerInstance = p.Infer<typeof parser>

const HEARTBEAT = TimeSpan.minutes(1)

const random = (): ServerInstance => {
  return {
    serverInstanceId: ServerInstanceId.generate(),
    startedAt: Posix.now(),
    stoppedAt: null,
    lastHeartbeatAt: Posix.now(),
    ipAddress: null,
    port: null
  }
}

export const ServerInstance = {
  ...parser,
  HEARTBEAT,
  random
}
