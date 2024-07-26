import type { SpaceId } from 'gamezilla-app/app/@/data'
import type { Task } from 'gamezilla-app/@/core'
import type * as Game from '../../game/game.types'

export type IGameDb = {
  getBySpaceId: (spaceId: SpaceId) => Task<string, Game.ModelServer | null>
  upsert: (spaceId: SpaceId, game: Game.ModelServer) => Task<string, null>
}
