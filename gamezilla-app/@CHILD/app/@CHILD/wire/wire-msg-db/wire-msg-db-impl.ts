import { IDbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { DbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-sql"
import { IWireMsgDb } from "./wire-msg-db"

export type Impl =
  | {
      t: "db-kv"
      dbConnKv: IDbConnKv
    }
  | {
      t: "db-sql"
      dbConnSql: DbConnSql
    }

export const WireMsgDb = <TMsg>(impl: Impl): IWireMsgDb<TMsg> => {
  switch (impl.t) {
    case "db-kv": {
      throw new Error("not implemented")
    }
    case "db-sql": {
      throw new Error("not implemented")
    }
  }
}
