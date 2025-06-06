import { ISqlDb } from '~/@/sql-db'
import type { ISpaceDb, SpaceDbConfig } from './interface'
import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'

export type Config = SpaceDbConfig & {
  t: 'sql-db'
  sqlDb: ISqlDb
}

export const Row = s.obj({
  spaceId: SpaceId,
  hostId: UserId,
})

export type Row = s.Infer<typeof Row>

export const SpaceDb = async (_config: Config): Promise<ISpaceDb> => {
  return {
    async get(input) {
      console.log('query', input)
      throw new Error('Not implemented')
    },
    upsert(space) {
      console.log('upsert', space)
      throw new Error('Not implemented')
    },
  }
}
