import { VsBotSetup } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/vs-bot"
import { SpaceCtx } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Err, isErr, Ok, Result } from "gamezilla-app/@SHARED/core"
import { Chess } from "../../@SHARED/chess"

//
//
//
// Model
//
//
//

export type ModelClient = {
  coreModel: CoreModel
  openedMenuId: string | null
  openedModal: null | "game-over"
  isFlipped: boolean
  vsBotSetup: VsBotSetup.Model
}

export type ModelServer = CoreModel

export type CoreModel = SetupModel | ModelSync | GameOverModel

export type SetupModel = {
  type: "setup"
  userColor: Chess.Color
  userId: UserId | null
  botLevel: Chess.BotLevel
}

export type ModelSync = {
  type: "game"
  userColor: Chess.Color
  userId: UserId
  board: Chess.Model
  botLevel: Chess.BotLevel
}

export type GameOverModel = {
  type: "game-over"
  gameOver: GameOver
  userColor: Chess.Color
  userId: UserId
  board: Chess.Model
  botLevel: Chess.BotLevel
}

export type GameOver = Chess.GameOver

export const initCore: CoreModel = {
  type: "setup",
  userColor: "w",
  userId: null,
  botLevel: 1,
}

export const initServer = ({
  userId,
}: {
  userId: UserId | null
}): ModelServer => {
  return {
    type: "setup",
    botLevel: initCore.botLevel,
    userColor: initCore.userColor,
    userId,
  }
}

export const isBotTurn = (model: CoreModel) => {
  return model.type === "game" && Chess.toTurn(model.board) !== model.userColor
}

//
//
//
// Msg
//
//
//

export type MsgClient =
  | Req
  | { t: "opened-menu"; menuId: string }
  | { t: "closed-menu" }
  | { t: "clicked-flip" }
  | { t: "closed-modal" }
  | { t: "vs-bot-setup"; c: VsBotSetup.Msg }

export type MsgServer = {
  t: "bot-moved"
  moved: Chess.BestMoveInputResult
}

export type MsgToServer = Req

export type MsgToClient =
  | Res
  | {
      t: "bot-moved"
      result: Result<string, CoreModel & { didCapture: boolean }>
    }
  | { t: "player-left"; model: CoreModel }

export type Req =
  | { t: "input-bot-level"; botLevel: Chess.BotLevel }
  | { t: "start-playing"; color: Chess.Color }
  | { t: "stop-playing" }
  | { t: "start-game" }
  | { t: "stop-game" }
  | { t: "input-move"; move: Chess.MoveInput }

export type Res = Req & {
  result: Result<string, CoreModel & { didCapture?: boolean }>
}

//
//
//
//

export const updateCore = ({
  msg,
  model,
  ctx,
}: {
  ctx: SpaceCtx & { currentUserId: UserId }
  msg: Req
  model: CoreModel
}): Result<string, CoreModel & { didCapture?: boolean }> => {
  switch (model.type) {
    case "setup": {
      switch (msg.t) {
        case "start-game": {
          if (!model.userId) {
            return Err("missing-user")
          }
          if (
            model.userId !== ctx.currentUserId ||
            model.userId !== ctx.space.hostId
          ) {
            return Err("not-allowed")
          }
          return Ok({
            type: "game",
            botLevel: model.botLevel,
            userColor: model.userColor,
            userId: model.userId,
            board: Chess.init(),
          })
        }

        case "input-bot-level": {
          if (
            model.userId !== ctx.currentUserId ||
            model.userId !== ctx.space.hostId
          ) {
            return Err("not-allowed")
          }
          return Ok({
            ...model,
            botLevel: msg.botLevel,
          })
        }

        case "stop-playing": {
          if (model.userId !== ctx.currentUserId) {
            return Err("not-allowed")
          }
          return Ok({
            ...model,
            userId: null,
          })
        }

        case "start-playing": {
          if (model.userId !== null && model.userId !== ctx.currentUserId) {
            return Err("not-allowed")
          }
          return Ok({
            ...model,
            userId: ctx.currentUserId,
            userColor: msg.color,
          })
        }

        default: {
          return Err("unhandled")
        }
      }
    }

    case "game": {
      switch (msg.t) {
        case "input-move": {
          if (model.userId !== ctx.currentUserId) {
            return Err("must-be-playing")
          }

          if (Chess.toTurn(model.board) !== model.userColor) {
            return Err("must-be-turn")
          }

          const moved = Chess.move(msg.move, model.board)

          if (moved.t === "err") {
            return moved
          }

          const boardNew = moved.value

          const gameOver = Chess.toGameOver(boardNew)

          if (gameOver.type !== "none") {
            return Ok({
              ...model,
              type: "game-over",
              board: boardNew,
              gameOver: gameOver,
              didCapture: boardNew.didCapture,
            })
          }

          const modelNew: CoreModel = {
            ...model,
            board: boardNew,
          }

          return Result.ok({
            ...modelNew,
            didCapture: boardNew.didCapture,
          })
        }

        case "stop-game": {
          if (
            model.userId !== ctx.currentUserId ||
            ctx.currentUserId !== ctx.space.hostId
          ) {
            return Err("not-allowed")
          }
          return Ok({
            type: "setup",
            botLevel: model.botLevel,
            userColor: model.userColor,
            userId: model.userId,
          })
        }

        default: {
          return Err("unhandled")
        }
      }
    }

    case "game-over": {
      switch (msg.t) {
        case "stop-game": {
          if (
            model.userId !== ctx.currentUserId ||
            ctx.currentUserId !== ctx.space.hostId
          ) {
            return Err("not-allowed")
          }
          return Ok({
            type: "setup",
            botLevel: model.botLevel,
            userColor: model.userColor,
            userId: model.userId,
          })
        }
        default: {
          return Err("unhandled")
        }
      }
    }

    default: {
      return Err("unhandled")
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
  model: CoreModel,
): Result<string, CoreModel & { didCapture: boolean }> => {
  if (model.type !== "game") {
    return Err("must_be_started")
  }

  if (botMoveResult.t === "err") {
    return botMoveResult
  }

  const botMoveInput = botMoveResult.value

  const botColor = Chess.toOppositeColor(model.userColor)

  if (Chess.toTurn(model.board) !== botColor) {
    return Err("must_be_turn")
  }

  const result = Chess.move(botMoveInput, model.board)

  if (isErr(result)) {
    return result
  }

  const { didCapture, ...boardNew } = result.value

  const gameOver = Chess.toGameOver(boardNew)

  if (gameOver.type !== "none") {
    const modelNew: CoreModel = {
      ...model,
      type: "game-over",
      gameOver: gameOver,
      board: boardNew,
    }
    return Ok({ ...modelNew, didCapture })
  }

  return Ok({
    ...model,
    board: boardNew,
    didCapture,
  })
}
