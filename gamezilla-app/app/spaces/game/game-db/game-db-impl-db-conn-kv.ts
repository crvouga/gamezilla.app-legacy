import { IDbConnKv } from "gamezilla-app/app/@SHARED/server/db-conn-kv"
import { IGameDb } from "./game-db"
import * as Game from "../../@CHILD/game/game.core"
import { SpaceId } from "gamezilla-app/app/@SHARED/data"

const GameDb = ({ dbConnKv }: { dbConnKv: IDbConnKv }): IGameDb => {
  const bySpaceId = IDbConnKv.instance<SpaceId, Game.ModelServer>(
    dbConnKv,
    ["game", "game-by-id"],
    Game.ModelServer,
  )

  return {
    async getBySpaceId(spaceId) {
      return bySpaceId.get(spaceId)
    },
    async upsert(spaceId, game) {
      return bySpaceId.set(spaceId, game)
    },
  }
}

export const ImplDbConnKv = {
  GameDb,
}
