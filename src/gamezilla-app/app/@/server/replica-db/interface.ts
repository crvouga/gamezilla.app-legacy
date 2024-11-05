import { Result } from 'gamezilla-app/@/core'

export type ReplicaDb = {
  get: (serverId: string) => Promise<Result<string, string>>
}
