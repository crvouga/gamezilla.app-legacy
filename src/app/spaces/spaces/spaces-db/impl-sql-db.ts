import { ISqlDb } from '~/@/sql-db'
import type { ISpacesDb, SpacesDbConfig } from './interface'
import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'

export type Config = SpacesDbConfig & {
  t: 'sql-db'
  sqlDb: ISqlDb
}

export const Row = s.obj({
  spaceId: SpaceId,
  hostId: UserId,
})

export type Row = s.Infer<typeof Row>

export const SpacesDb = async (_config: Config): Promise<ISpacesDb> => {
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
