import { ILogger } from '~/@/logger'
import { ISync } from '~/@/sync-engine/sync-transaction'
import { IGuestSessionMappingDb } from './guest-session-mapping-db/interface'

export const GuestSessionMappingSync = (_config: {
  guestSessionMappingDb: IGuestSessionMappingDb
  logger: ILogger
}): ISync => {
  return {
    async push() {
      throw new Error('Not implemented')
    },
  }
}
