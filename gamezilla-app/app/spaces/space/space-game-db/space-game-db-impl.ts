import type { IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import type { IGameDb } from './space-game-db'
import * as ImplDbConnKv from './space-game-db-impl-db-conn-kv'

type Impl = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
}
export const GameDb = (impl: Impl): IGameDb => {
  switch (impl.t) {
    case 'db-conn-kv':
      return ImplDbConnKv.GameDb(impl)
  }
}
