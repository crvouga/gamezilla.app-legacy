import { exhaustive } from "../../../Core"
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
} from "../ConnectFour"

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

export type FrontendModel = SharedModel & { ghostIndex: ColumnIndex | "None" }

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

export type FrontendMsg = Req | ["Hovered", { columnIndex: ColumnIndex }]

export type BackendMsg = ["BotMove", BestMoveResult]

export type ToFrontend =
  | Res
  | ["PlayerLeft", SharedModel]
  | ["BotMove", BotMoveResult]

export type ToBackend = Req

export type Req =
  | ["StartPlaying", { userId: UserId }]
  | ["StopPlaying", { userId: UserId }]
  | ["InputPlayerType", { userId: UserId; playerType: PlayerType }]
  | ["InputBotLevel", { userId: UserId; botLevel: BotLevel }]
  | ["StartGame", { userId: UserId }]
  | ["InputMove", { userId: UserId; columnIndex: ColumnIndex }]
  | ["StopGame", { userId: UserId }]
  | ["SwapSides", { userId: UserId }]
  | ["Restart", { userId: UserId }]

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
    case "StartPlaying": {
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

    case "StopPlaying": {
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

    case "InputPlayerType": {
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

    case "InputBotLevel": {
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

    case "StartGame": {
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

    case "StopGame": {
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

    case "SwapSides": {
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

    case "InputMove": {
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

    case "Restart": {
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
