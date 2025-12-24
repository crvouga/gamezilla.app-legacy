import { ISync } from '~/@/sync-engine/sync-transaction'
import { IDb } from '~/@/db/interface'
import { SpaceEntity } from './space-db/space-entity'

export const SpaceSync = (_config: { spaceDb: IDb.IDb<SpaceEntity, {}> }): ISync => {
  return {
    async push() {
      throw new Error('Not implemented')
    },
  }
}
