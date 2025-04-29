import { Err, isErr, Ok, Result } from '~/@/result'
import { UserAccount } from '~/app/@/data/user-account'
import type { UserId } from '~/app/@/data/user-id'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import type { VsBotSetup } from '~/app/spaces/game/games/@/vs-bot'
import { Chess } from '../@/chess'
import { ChessBotLevel } from '../@/chess-bot-level/chess-bot-level'

//
//
//
// Model
//
//
//

export type ModelFrontend = {
  spaceModel: SpaceModel
  openedMenuId: string | null
  openedModal: null | 'game-over'
  isFlipped: boolean
  vsBotSetup: VsBotSetup.Model
}

export type ModelBackend = SpaceModel

export type SpaceModel = SetupModel | ModelSpace | GameOverModel

export type SetupModel = {
  type: 'setup'
  userColor: Chess.Color
  userId: UserId | null
  botLevel: ChessBotLevel
}

export type ModelSpace = {
  type: 'game'
  userColor: Chess.Color
  userId: UserId
  board: Chess.Model
  botLevel: ChessBotLevel
}

export type GameOverModel = {
  type: 'game-over'
  gameOver: GameOver
  userColor: Chess.Color
  userId: UserId
  board: Chess.Model
  botLevel: ChessBotLevel
}

export type GameOver = Chess.GameOver

export const initSpace: SpaceModel = {
  type: 'setup',
  userColor: 'w',
  userId: null,
  botLevel: 1,
}

export const initBackend = ({ userId }: { userId: UserId | null }): ModelBackend => {
  return {
    type: 'setup',
    botLevel: initSpace.botLevel,
    userColor: initSpace.userColor,
    userId,
  }
}

export const isBotTurn = (model: SpaceModel) => {
  return model.type === 'game' && Chess.toTurn(model.board) !== model.userColor
}

//
//
//
// Msg
//
//
//

export type MsgFrontend =
  | Req
  | { t: 'opened-menu'; menuId: string }
  | { t: 'closed-menu' }
  | { t: 'clicked-flip' }
  | { t: 'closed-modal' }
  | { t: 'vs-bot-setup'; c: VsBotSetup.Msg }

export type MsgBackend = {
  t: 'bot-moved'
  moved: Chess.BestMoveInputResult
}

export type MsgToBackend = Req

export type MsgToFrontend =
  | Res
  | {
      t: 'bot-moved'
      result: Result<
        string,
        SpaceModel & {
          didCapture: boolean
        }
      >
    }
  | { t: 'player-left'; model: SpaceModel }

export type Req =
  | { t: 'input-bot-level'; botLevel: ChessBotLevel }
  | { t: 'start-playing'; color: Chess.Color }
  | { t: 'stop-playing' }
  | { t: 'start-game' }
  | { t: 'stop-game' }
  | { t: 'input-move'; move: Chess.MoveInput }

export type Res = Req & {
  result: Result<
    string,
    SpaceModel & {
      didCapture?: boolean
    }
  >
}

//
//
//
//

export const updateSpace = ({
  msg,
  model,
  ctx,
}: {
  ctx: SpaceCtx & { currentUser: UserAccount | null }
  msg: Req
  model: SpaceModel
}): Result<string, SpaceModel & { didCapture?: boolean }> => {
  switch (model.type) {
    case 'setup': {
      switch (msg.t) {
        case 'start-game': {
          if (!model.userId) {
            return Err('missing-user')
          }
          if (model.userId !== ctx.currentUser?.userId || model.userId !== ctx.space.hostId) {
            return Err('not-allowed')
          }
          return Ok({
            type: 'game',
            botLevel: model.botLevel,
            userColor: model.userColor,
            userId: model.userId,
            board: Chess.init(),
          })
        }

        case 'input-bot-level': {
          if (model.userId !== ctx.currentUser?.userId || model.userId !== ctx.space.hostId) {
            return Err('not-allowed')
          }
          return Ok({
            ...model,
            botLevel: msg.botLevel,
          })
        }

        case 'stop-playing': {
          if (model.userId !== ctx.currentUser?.userId) {
            return Err('not-allowed')
          }
          return Ok({
            ...model,
            userId: null,
          })
        }

        case 'start-playing': {
          if (model.userId !== null && model.userId !== ctx.currentUser?.userId) {
            return Err('not-allowed')
          }
          return Ok({
            ...model,
            userId: ctx.currentUser?.userId ?? null,
            userColor: msg.color,
          })
        }

        default: {
          return Err('unhandled')
        }
      }
    }

    case 'game': {
      switch (msg.t) {
        case 'input-move': {
          if (model.userId !== ctx.currentUser?.userId) {
            return Err('must-be-playing')
          }

          if (Chess.toTurn(model.board) !== model.userColor) {
            return Err('must-be-turn')
          }

          const moved = Chess.move(msg.move, model.board)

          if (moved.t === 'err') {
            return moved
          }

          const boardNew = moved.value

          const gameOver = Chess.toGameOver(boardNew)

          if (gameOver.type !== 'none') {
            return Ok({
              ...model,
              type: 'game-over',
              board: boardNew,
              gameOver: gameOver,
              didCapture: boardNew.didCapture,
            })
          }

          const modelNew: SpaceModel = {
            ...model,
            board: boardNew,
          }

          return Result.Ok({
            ...modelNew,
            didCapture: boardNew.didCapture,
          })
        }

        case 'stop-game': {
          if (model.userId !== ctx.currentUser?.userId || ctx.currentUser?.userId !== ctx.space.hostId) {
            return Err('not-allowed')
          }
          return Ok({
            type: 'setup',
            botLevel: model.botLevel,
            userColor: model.userColor,
            userId: model.userId,
          })
        }

        default: {
          return Err('unhandled')
        }
      }
    }

    case 'game-over': {
      switch (msg.t) {
        case 'stop-game': {
          if (model.userId !== ctx.currentUser?.userId || ctx.currentUser?.userId !== ctx.space.hostId) {
            return Err('not-allowed')
          }
          return Ok({
            type: 'setup',
            botLevel: model.botLevel,
            userColor: model.userColor,
            userId: model.userId,
          })
        }
        default: {
          return Err('unhandled')
        }
      }
    }

    default: {
      return Err('unhandled')
    }
  }
}

//
//
//
// Bot Moved
//
//
//

export const botMoved = (
  botMoveResult: Chess.BestMoveInputResult,
  model: SpaceModel,
): Result<string, SpaceModel & { didCapture: boolean }> => {
  if (model.type !== 'game') {
    return Err('must_be_started')
  }

  if (botMoveResult.t === 'err') {
    return botMoveResult
  }

  const botMoveInput = botMoveResult.value

  const botColor = Chess.toOppositeColor(model.userColor)

  if (Chess.toTurn(model.board) !== botColor) {
    return Err('must_be_turn')
  }

  const result = Chess.move(botMoveInput, model.board)

  if (isErr(result)) {
    return result
  }

  const { didCapture, ...boardNew } = result.value

  const gameOver = Chess.toGameOver(boardNew)

  if (gameOver.type !== 'none') {
    const modelNew: SpaceModel = {
      ...model,
      type: 'game-over',
      gameOver: gameOver,
      board: boardNew,
    }
    return Ok({
      ...modelNew,
      didCapture,
    })
  }

  return Ok({
    ...model,
    board: boardNew,
    didCapture,
  })
}
