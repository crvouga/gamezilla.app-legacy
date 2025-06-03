import { ISqlDb } from '~/@/sql-db'
import type { ISpacesDb, SpacesDbConfig } from './interface'

export type Config = SpacesDbConfig & {
  t: 'sql-db'
  sqlDb: ISqlDb
}

export const SpacesDb = async (_config: Config): Promise<ISpacesDb> => {
  throw new Error('Not implemented')
}
