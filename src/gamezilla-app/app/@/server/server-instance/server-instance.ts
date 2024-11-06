import { Posix } from 'gamezilla-app/@/core'
import { ServerInstanceId } from './server-instance-id'

export type ServerInstance = {
  serverInstanceId: ServerInstanceId
  startedAt: Posix
  lastHeartbeatAt: Posix
}
