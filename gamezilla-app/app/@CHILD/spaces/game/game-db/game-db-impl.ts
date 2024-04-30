import { IDbConnKv } from "gamezilla-app/app/@SHARED/server/db-conn-kv"
import { IGameDb } from "./game-db"
import { ImplDbConnKv } from "./game-db-impl-db-conn-kv"

type Impl = {
  t: "db-conn-kv"
  dbConnKv: IDbConnKv
}
export const GameDb = (impl: Impl): IGameDb => {
  switch (impl.t) {
    case "db-conn-kv":
      return ImplDbConnKv.GameDb(impl)
  }
}
