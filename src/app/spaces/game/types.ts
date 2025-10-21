import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import * as GameTypes from '../game/games/types'
import { GamesTypes } from './games'
import { GameName } from './games/@/game-name'

export type GamesBackendCtxModule = SpaceBackendCtx & GameTypes.GameBackendCtxModule

export type ModelFrontend = {
  spaces_games: {
    [spaceId: SpaceId]: GameTypes.ModelFrontend
  }
}

export type MsgFrontend =
  | {
      t: 'game_gotGameMsg'
      spaceId: SpaceId
      c: GamesTypes.MsgFrontend
    }
  | {
      t: 'game_clickedGameTile'
      gameName: GameName
      userId: UserId
      spaceId: SpaceId
    }
