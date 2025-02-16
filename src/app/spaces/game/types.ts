import { SpaceId } from '~/app/@/data/space-id'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import * as GameTypes from '../game/games/types'
import { GamesTypes } from './games'
import { GameName } from './games/@/game-name'

export type GamesBackendCtx = SpaceBackendCtx & GameTypes.GameBackendCtx

export type ModelFrontend = {
  games: {
    [spaceId: SpaceId]: GameTypes.ModelFrontend
  }
}

export type MsgBackend = { t: 'game'; spaceId: SpaceId; c: GamesTypes.MsgBackend }

export type MsgFrontend =
  | {
      t: 'game'
      spaceId: SpaceId
      c: GamesTypes.MsgFrontend
    }
  | {
      t: 'game.clicked-game-tile'
      gameName: GameName
    }

export type MsgToFrontend = {
  t: 'game'
  spaceId: SpaceId
  c: GamesTypes.MsgToFrontend
}

export type MsgToBackend = {
  t: 'game'
  spaceId: SpaceId
  c: GamesTypes.MsgToBackend
}
