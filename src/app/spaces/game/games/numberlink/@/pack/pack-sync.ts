import { Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync-transaction'
import { IPackDb } from './pack-db/interface'

export const PackDbSync = (_config: { numberlinkPackDb: IPackDb }): ISync => {
  return {
    async push() {
      return Ok(null)
    },
  }
}
