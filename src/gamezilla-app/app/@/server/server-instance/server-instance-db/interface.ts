import { Result, TimeSpan } from 'gamezilla-app/@/core'
import { ServerInstance } from '../server-instance'
import { ServerInstanceId } from '../server-instance-id'

export type IServerInstanceDb = {
  get: (serverId: ServerInstanceId) => Promise<Result<string, ServerInstance | null>>
  put: (serverInstance: ServerInstance) => Promise<Result<string, null>>
  list: () => Promise<Result<string, ServerInstance[]>>
  listAlive: (input: { minimalHeartrate: TimeSpan }) => Promise<Result<string, ServerInstance[]>>
}
