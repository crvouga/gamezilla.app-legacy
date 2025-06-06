import { ISqlDb } from '~/@/sql-db'
import type { ISpaceProjectionDb, SpaceProjectionDbConfig } from './interface'
import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'

export type Config = SpaceProjectionDbConfig & {
  t: 'sql-db'
  sqlDb: ISqlDb
}

export const Row = s.obj({
  spaceId: SpaceId,
  hostId: UserId,
})

export type Row = s.Infer<typeof Row>

export const SpaceProjectionDb = async (_config: Config): Promise<ISpaceProjectionDb> => {
  return {
    async query(input) {
      console.log('query', input)
      throw new Error('Not implemented')
    },
    upsert(space) {
      console.log('upsert', space)
      throw new Error('Not implemented')
    },
  }
}
