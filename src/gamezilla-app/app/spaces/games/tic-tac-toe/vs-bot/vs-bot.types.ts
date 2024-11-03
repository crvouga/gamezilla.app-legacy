import { Err, isErr, Ok, type Result } from 'gamezilla-app/@/core'
import type { UserId } from 'gamezilla-app/app/@/data'
import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space-ctx'
import type { VsBotSetup } from 'gamezilla-app/app/spaces/games/@/vs-bot'
import {
  type BotLevel,
  emptyBoard,
  type Model,
  move,
  type PlayerType,
  type Position,
  toOpposite,
  toStatus
} from '../@/tic-tic-toe/tic-tac-toe'

//
//
//
// Model
//
//
//

export type CoreModel = SetupModel | ModelCore

export type SetupModel = {
  type: 'setup'
  player?: UserId | null
  userPlayerType: PlayerType
  botLevel: BotLevel
}

export type ModelCore = {
  type: 'game'
  player: UserId
  userPlayerType: PlayerType
  botLevel: BotLevel
  board: Model
}

export type ModelClient = CoreModel & {
  vsBotSetup: VsBotSetup.Model
}

export type ModelServer = CoreModel

export const initCoreModel = ({ userId }: { userId: SetupModel['player'] }): CoreModel => {
  return {
    type: 'setup',
    botLevel: 'Medium',
    userPlayerType: 'X',
    player: userId
  }
}

export const isBotTurn = (model: CoreModel): model is ModelCore => {
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

export type MsgClient = Req | { t: 'vs-bot-setup'; c: VsBotSetup.Msg }

export type MsgServer = { t: 'bot-moved' }

export type MsgToServer = Req

export type MsgToClient =
  | Res
  | { t: 'bot-moved'; result: Result<string, CoreModel> }
  | { t: 'player-left'; result: Result<string, CoreModel> }

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
  result: Result<string, CoreModel>
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
  model
}: {
  ctx: SpaceCtx & { currentUserId: UserId }
  msg: Req
  model: CoreModel
}): Result<string, CoreModel> => {
  switch (msg.t) {
    case 'input-bot-level': {
      if (model.type !== 'setup') {
        return Err('must-be-in-setup-mode')
      }

      if (model.player !== ctx.currentUserId) {
        return Err('must-be-player')
      }

      return Ok({
        ...model,
        botLevel: msg.botLevel
      })
    }

    case 'start-playing': {
      if (model.type !== 'setup') {
        return Err('must-be-in-setup-mode')
      }

      if (model.player && model.player !== ctx.currentUserId) {
        return Err('not-allowed')
      }

      return Ok({
        ...model,
        userPlayerType: msg.playerType,
        player: ctx.currentUserId
      })
    }

    case 'stop-playing': {
      if (model.type !== 'setup') {
        return Err('must-be-in-setup-mode')
      }

      if (model.player !== ctx.currentUserId) {
        return Err('must-be-player')
      }

      return Ok({
        ...model,
        player: null
      })
    }

    case 'start-game': {
      if (model.type !== 'setup') {
        return Err('must-be')
      }

      if (model.player === 'none') {
        return Err('missing_player')
      }

      if (model.player !== ctx.currentUserId) {
        return Err('must-be-player')
      }

      return Ok({
        type: 'game',
        board: emptyBoard,
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType
      })
    }

    case 'stop-game': {
      if (model.type !== 'game') {
        return Err('must-be-in-game-mode')
      }

      if (model.player !== ctx.currentUserId) {
        return Err('must-be-player')
      }

      return Ok({
        type: 'setup',
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType
      })
    }

    case 'input-move': {
      if (model.type !== 'game') {
        return Err('must-be-in-game-mode')
      }

      if (model.player !== ctx.currentUserId) {
        return Err('must-be-player')
      }

      const result = move({
        board: model.board,
        player: model.userPlayerType,
        position: msg.position
      })

      if (isErr(result)) {
        return result
      }

      const modelNext: CoreModel = {
        ...model,
        board: result.value
      }

      return Ok(modelNext)
    }

    case 'swap-sides': {
      if (model.type !== 'game') {
        return Err('must-be-in-game-mode')
      }

      if (model.player !== ctx.currentUserId) {
        return Err('must-be-player')
      }

      const modelNext: CoreModel = {
        ...model,
        board: emptyBoard,
        userPlayerType: toOpposite(model.userPlayerType)
      }

      return Ok(modelNext)
    }

    case 'restart': {
      if (model.type !== 'game') {
        return Err('must-be-in-game-mode')
      }

      if (model.player !== ctx.currentUserId) {
        return Err('must-be-player')
      }

      return Ok({
        ...model,
        board: emptyBoard
      })
    }
  }
}
