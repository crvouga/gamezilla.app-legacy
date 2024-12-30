import { Result } from '~/@/core'
import { ServerInstance } from '../server-instance'
import { ServerInstanceId } from '../server-instance-id'
import { TimeSpan } from '~/@/time/time-span'

export type IServerInstanceDb = {
  get: (serverId: ServerInstanceId) => Promise<Result<string, ServerInstance | null>>
  put: (serverInstance: ServerInstance) => Promise<Result<string, null>>
  list: () => Promise<Result<string, ServerInstance[]>>
  listAlive: (input: { minimalHeartRate: TimeSpan }) => Promise<Result<string, ServerInstance[]>>
}
