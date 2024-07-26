import { DbConnKv, type IDbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import type { IWireSessionDb } from './wire-session-db'
import { WireSessionDbKv } from './wire-session-db-impl-db-kv'

type Impl =
  | {
      t: 'db-conn-kv'
      dbConnKv: IDbConnKv
    }
  | {
      t: 'hash-map'
    }

export const WireSessionDb = async (impl: Impl): Promise<IWireSessionDb> => {
  switch (impl.t) {
    case 'db-conn-kv':
      return WireSessionDbKv(impl)
    case 'hash-map':
      return WireSessionDbKv({
        dbConnKv: await DbConnKv({
          t: 'hash-map'
        })
      })
  }
}
