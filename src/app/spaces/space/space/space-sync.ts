import { ISync } from '~/@/sync-engine/sync-transaction'
import { ISpaceDb } from './space-db/interface'

export const SpaceSync = (_config: { spaceDb: ISpaceDb }): ISync => {
  return {
    async push() {
      throw new Error('Not implemented')
    },
  }
}
