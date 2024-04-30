import { IDbConnKv } from "gamezilla-app/app/@shared/server/db-conn-kv"
import { IDbConnSql } from "gamezilla-app/app/@shared/server/db-conn-sql"
import { IWireMsgDb } from "./wire-msg-db"

export type Impl =
  | {
      t: "db-conn-kv"
      dbConnKv: IDbConnKv
    }
  | {
      t: "db-sql"
      dbConnSql: IDbConnSql
    }

export const WireMsgDb = <TMsg>(impl: Impl): IWireMsgDb<TMsg> => {
  switch (impl.t) {
    case "db-conn-kv": {
      throw new Error("not implemented")
    }
    case "db-sql": {
      throw new Error("not implemented")
    }
  }
}
