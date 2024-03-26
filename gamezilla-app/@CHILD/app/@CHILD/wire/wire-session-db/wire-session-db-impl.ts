import {
  DbConnKv,
  IDbConnKv,
} from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { IWireSessionDb } from "./wire-session-db"
import { WireSessionDbKv } from "./wire-session-db-impl-db-kv"

type Impl =
  | {
      t: "db-conn-kv"
      dbConnKv: IDbConnKv
    }
  | {
      t: "hash-map"
    }

export const WireSessionDb = async (impl: Impl): Promise<IWireSessionDb> => {
  switch (impl.t) {
    case "db-conn-kv":
      return WireSessionDbKv(impl)
    case "hash-map":
      return WireSessionDbKv({
        dbConnKv: await DbConnKv({
          t: "hash-map",
        }),
      })
  }
}
