import { SpaceId } from "gamezilla-app/app/@shared/data"
import { Task } from "gamezilla-app/@shared/core"
import * as Game from "../../game/game.core"

export type IGameDb = {
  getBySpaceId: (spaceId: SpaceId) => Task<string, Game.ModelServer | null>
  upsert: (spaceId: SpaceId, game: Game.ModelServer) => Task<string, null>
}
