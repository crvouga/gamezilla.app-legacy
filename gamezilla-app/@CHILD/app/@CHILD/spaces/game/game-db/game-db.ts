import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Task } from "gamezilla-app/@SHARED/core"
import * as Game from "../../@CHILD/game/game.core"

export type IGameDb = {
  getBySpaceId: (spaceId: SpaceId) => Task<string, Game.ModelServer | null>
  upsert: (spaceId: SpaceId, game: Game.ModelServer) => Task<string, null>
}
