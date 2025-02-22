import { Err, isErr, Ok, type Result } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import type { VsBotSetup } from '~/app/spaces/game/games/@/vs-bot'
import {
  type BotLevel,
  emptyBoard,
  type Model,
  move,
  type PlayerType,
  type Position,
  toOpposite,
  toStatus,
} from '../@/tic-tic-toe/tic-tac-toe'
import { UserAccount } from '~/app/@/data/account'

//
//
//
// Model
//
//
//

export type SpaceModel = SetupModel | ModelSpace

export type SetupModel = {
  type: 'setup'
  player?: UserId | null
  userPlayerType: PlayerType
  botLevel: BotLevel
}

export type ModelSpace = {
  type: 'game'
  player: UserId
  userPlayerType: PlayerType
  botLevel: BotLevel
  board: Model
}

export type ModelFrontend = SpaceModel & {
  vsBotSetup: VsBotSetup.Model
}

export type ModelBackend = SpaceModel

export const initSpaceModel = ({ userId }: { userId: SetupModel['player'] }): SpaceModel => {
  return {
    type: 'setup',
    botLevel: 'Medium',
    userPlayerType: 'X',
    player: userId,
  }
}

export const isBotTurn = (model: SpaceModel): model is ModelSpace => {
  if (model.type !== 'game') {
    return false
  }

  const status = toStatus(model.board)

  return status.type === 'Turn' && status.turn === toOpposite(model.userPlayerType)
}

//
//
//
// Msg
//
//
//

export type MsgFrontend = Req | { t: 'vs-bot-setup'; c: VsBotSetup.Msg }

export type MsgBackend = { t: 'bot-moved' }

export type MsgToBackend = Req

export type MsgToFrontend =
  | Res
  | { t: 'bot-moved'; result: Result<string, SpaceModel> }
  | { t: 'player-left'; result: Result<string, SpaceModel> }

export type Req =
  | { t: 'input-bot-level'; botLevel: BotLevel }
  | { t: 'start-playing'; playerType: PlayerType }
  | { t: 'stop-playing' }
  | { t: 'start-game' }
  | { t: 'stop-game' }
  | { t: 'input-move'; position: Position }
  | { t: 'swap-sides' }
  | { t: 'restart' }

export type Res = Req & {
  result: Result<string, SpaceModel>
}

//
//
//
//
//
//

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: SpaceCtx & { currentUser: UserAccount | null }
  msg: Req
  model: SpaceModel
}): Result<string, SpaceModel> => {
  switch (msg.t) {
    case 'input-bot-level': {
      if (model.type !== 'setup') {
        return Err('must-be-in-setup-mode')
      }

      if (model.player !== ctx.currentUser?.userId) {
        return Err('must-be-player')
      }

      return Ok({
        ...model,
        botLevel: msg.botLevel,
      })
    }

    case 'start-playing': {
      if (model.type !== 'setup') {
        return Err('must-be-in-setup-mode')
      }

      if (model.player && model.player !== ctx.currentUser?.userId) {
        return Err('not-allowed')
      }

      return Ok({
        ...model,
        userPlayerType: msg.playerType,
        player: ctx.currentUser?.userId,
      })
    }

    case 'stop-playing': {
      if (model.type !== 'setup') {
        return Err('must-be-in-setup-mode')
      }

      if (model.player !== ctx.currentUser?.userId) {
        return Err('must-be-player')
      }

      return Ok({
        ...model,
        player: null,
      })
    }

    case 'start-game': {
      if (model.type !== 'setup') return Err('must-be')

      if (model.player === 'none') return Err('missing_player')

      if (!model.player) return Err('must-be-player')

      if (model.player !== ctx.currentUser?.userId) return Err('must-be-player')

      return Ok({
        type: 'game',
        board: emptyBoard,
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
      })
    }

    case 'stop-game': {
      if (model.type !== 'game') {
        return Err('must-be-in-game-mode')
      }

      if (model.player !== ctx.currentUser?.userId) {
        return Err('must-be-player')
      }

      return Ok({
        type: 'setup',
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
      })
    }

    case 'input-move': {
      if (model.type !== 'game') {
        return Err('must-be-in-game-mode')
      }

      if (model.player !== ctx.currentUser?.userId) {
        return Err('must-be-player')
      }

      const result = move({
        board: model.board,
        player: model.userPlayerType,
        position: msg.position,
      })

      if (isErr(result)) {
        return result
      }

      const modelNext: SpaceModel = {
        ...model,
        board: result.value,
      }

      return Ok(modelNext)
    }

    case 'swap-sides': {
      if (model.type !== 'game') {
        return Err('must-be-in-game-mode')
      }

      if (model.player !== ctx.currentUser?.userId) {
        return Err('must-be-player')
      }

      const modelNext: SpaceModel = {
        ...model,
        board: emptyBoard,
        userPlayerType: toOpposite(model.userPlayerType),
      }

      return Ok(modelNext)
    }

    case 'restart': {
      if (model.type !== 'game') {
        return Err('must-be-in-game-mode')
      }

      if (model.player !== ctx.currentUser?.userId) {
        return Err('must-be-player')
      }

      return Ok({
        ...model,
        board: emptyBoard,
      })
    }
  }
}
