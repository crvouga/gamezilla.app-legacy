import { Result } from 'gamezilla-app/@/core'
import { ServerInstanceId } from '../server-instance-id'

export type IServerInstanceDb = {
  get: (serverId: ServerInstanceId) => Promise<Result<string, string>>
}
