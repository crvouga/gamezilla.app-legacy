import { Result } from 'gamezilla-app/@/core'
import { ServerInstanceId } from '../server-instance-id'
import { ServerInstance } from '../server-instance'

export type IServerInstanceDb = {
  get: (serverId: ServerInstanceId) => Promise<Result<string, ServerInstance | null>>
  put: (serverInstance: ServerInstance) => Promise<Result<string, null>>
  list: () => Promise<Result<string, ServerInstance[]>>
}
