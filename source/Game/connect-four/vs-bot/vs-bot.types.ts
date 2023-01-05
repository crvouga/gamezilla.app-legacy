import { exhaustive } from "../../../Core"
import * as Spring from "../../../Core/animation/spring"
import { Err, Ok, Result } from "../../../Core/Result"
import { UserId } from "../../../Data/UserId"
import {
  BestMoveProblem,
  BestMoveResult,
  ColumnIndex,
  Columns,
  emptyColumns,
  move,
  MoveProblem,
  opposite,
  PlayerType,
  toStatus,
  VisualModel
} from "../connect-four/connect-four"

//
//
// Model
//
//

export type SharedModel = SetupModel | GameModel

export type SetupModel = {
  type: "Setup"
  userPlayerType: PlayerType
  botLevel: BotLevel
  player: UserId | "None"
}

export type GameModel = {
  type: "Game"
  userPlayerType: PlayerType
  botLevel: BotLevel
  player: UserId
  columns: Columns
}

export const isBotTurn = (model: SharedModel): boolean => {
  if (model.type !== "Game") {
    return false
  }
  const status = toStatus(model.columns)
  return (
    status.type === "Playing" && status.turn === opposite[model.userPlayerType]
  )
}

export type BackendModel = SharedModel

export type FrontendModel = SetupModel | (GameModel & {
  ghostIndex: ColumnIndex | "None",
  animationValue: Spring.Model,
  animationDirection: "right" | "left"
  visual: VisualModel
})

export const initShared = ({
  player,
}: {
  player: UserId | "None"
}): SharedModel => {
  return {
    type: "Setup",
    botLevel: "Medium",
    player: player,
    userPlayerType: "PlayerOne",
  }
}

//
//
//
//

export type GameOver = { type: "Tie" } | { type: "Winner"; winner: PlayerType }

export const toGameOver = (model: SharedModel): GameOver | { type: "None" } => {
  switch (model.type) {
    case "Game": {
      const status = toStatus(model.columns)
      switch (status.type) {
        case "Playing": {
          return { type: "None" }
        }
        case "Tie": {
          return { type: "Tie" }
        }

        case "Winner": {
          return { type: "Winner", winner: status.winner }
        }
      }
    }

    case "Setup": {
      return { type: "None" }
    }
  }
}

type BotLevel = "Easy" | "Medium" | "Hard"

export const botLevel: { [botLevel in BotLevel]: BotLevel } = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
}

//
//
// Msg
//
//

export type FrontendMsg = Req | ["hovered", { columnIndex: ColumnIndex }] | ["frame"] | ['clicked-animation']

export type BackendMsg = ["bot-move", BestMoveResult]

export type ToFrontend =
  | Res
  | ["player-left", SharedModel]
  | ["bot-move", BotMoveResult]

export type ToBackend = Req

export type Req =
  | ["start-playing", { userId: UserId }]
  | ["stop-playing", { userId: UserId }]
  | ["input-player-type", { userId: UserId; playerType: PlayerType }]
  | ['input-bot-level', { userId: UserId; botLevel: BotLevel }]
  | ['start-game', { userId: UserId }]
  | ['input-move', { userId: UserId; columnIndex: ColumnIndex }]
  | ['stop-game', { userId: UserId }]
  | ['swap-sides', { userId: UserId }]
  | ['restart', { userId: UserId }]

export type Res = [Req[0], Result<Problem, SharedModel>]

export type Problem =
  | "not_setup"
  | "not_game"
  | "player_taken"
  | "not_playing"
  | "missing_player"
  | MoveProblem

//
//
//
//

export const handle = (
  msg: Req,
  model: SharedModel,
): Result<Problem, SharedModel> => {
  switch (msg[0]) {
    case "start-playing": {
      if (model.type !== "Setup") {
        return Err("not_setup")
      }

      if (model.player !== "None") {
        return Err("player_taken")
      }

      const modelNew: SharedModel = {
        ...model,
        player: msg[1].userId,
      }

      return Ok(modelNew)
    }

    case "stop-playing": {
      if (model.type !== "Setup") {
        return Err("not_setup")
      }

      if (model.player === "None") {
        return Err("not_playing")
      }

      if (model.player !== msg[1].userId) {
        return Err("not_playing")
      }

      const modelNew: SharedModel = {
        ...model,
        player: "None",
      }

      return Ok(modelNew)
    }

    case "input-player-type": {
      if (model.type !== "Setup") {
        return Err("not_setup")
      }

      if (model.player !== msg[1].userId) {
        return Err("not_playing")
      }

      const modelNew: SharedModel = {
        ...model,
        userPlayerType: msg[1].playerType,
      }

      return Ok(modelNew)
    }

    case 'input-bot-level': {
      if (model.type !== "Setup") {
        return Err("not_setup")
      }

      if (model.player !== msg[1].userId) {
        return Err("not_playing")
      }

      const modelNew: SharedModel = {
        ...model,
        botLevel: msg[1].botLevel,
      }

      return Ok(modelNew)
    }

    case 'start-game': {
      if (model.type !== "Setup") {
        return Err("not_setup")
      }

      if (model.player !== msg[1].userId) {
        return Err("not_playing")
      }

      if (model.player === "None") {
        return Err("missing_player")
      }

      const modelNew: SharedModel = {
        type: "Game",
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
        columns: emptyColumns,
      }

      return Ok(modelNew)
    }

    case 'stop-game': {
      if (model.type !== "Game") {
        return Err("not_game")
      }

      if (model.player !== msg[1].userId) {
        return Err("not_playing")
      }

      const modelNew: SharedModel = {
        type: "Setup",
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
      }

      return Ok(modelNew)
    }

    case 'swap-sides': {
      if (model.type !== "Game") {
        return Err("not_game")
      }

      if (model.player !== msg[1].userId) {
        return Err("not_playing")
      }

      const modelNew: SharedModel = {
        ...model,
        columns: emptyColumns,
        userPlayerType: opposite[model.userPlayerType],
      }

      return Ok(modelNew)
    }

    case 'input-move': {
      if (model.type !== "Game") {
        return Err("not_game")
      }

      if (model.player !== msg[1].userId) {
        return Err("not_playing")
      }

      const result = move(
        model.columns,
        msg[1].columnIndex,
        model.userPlayerType,
      )

      if (result.type === "Err") {
        return result
      }

      const modelNew: SharedModel = {
        ...model,
        columns: result.value,
      }

      return Ok(modelNew)
    }

    case 'restart': {
      if (model.type !== "Game") {
        return Err("not_game")
      }

      if (model.player !== msg[1].userId) {
        return Err("not_playing")
      }

      const modelNew: GameModel = {
        ...model,
        columns: emptyColumns,
      }

      return Ok(modelNew)
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

type BotMoveResult = Result<
  MoveProblem | BestMoveProblem | "not_game",
  SharedModel
>

export const botMove = (
  bestMoveResult: BestMoveResult,
  model: SharedModel,
): BotMoveResult => {
  if (model.type !== "Game") {
    return Err("not_game")
  }

  if (bestMoveResult.type === "Err") {
    return bestMoveResult
  }

  const moveResult = move(
    model.columns,
    bestMoveResult.value,
    opposite[model.userPlayerType],
  )

  if (moveResult.type === "Err") {
    return moveResult
  }

  const modelNew: SharedModel = {
    ...model,
    columns: moveResult.value,
  }

  return Ok(modelNew)
}
