import { exhaustive } from "../../../Core"
import { Err, Ok, Result } from "../../../Core/Result"
import { UserId } from "../../../Data/UserId"
import {
  allColumnIndexes,
  ColumnIndex,
  Columns,
  emptyColumns,
  move,
  MoveProblem,
  MoveResult,
  opposite,
  PlayerType,
  toStatus,
  toTurn,
} from "../ConnectFour"

//
//
//
// Model
//
//
//

export type SharedModel = SetupModel | GameModel | GameOverModel

export type SetupModel = {
  type: "Setup"
  moveTimeLimit: MoveTimeLimit
  PlayerOne: UserId | "None"
  PlayerTwo: UserId | "None"
}

export type GameModel = {
  type: "Game"
  PlayerOne: UserId
  PlayerTwo: UserId
  moveTimeLimit: MoveTimeLimit
  moveCountDown: number
  columns: Columns
}

export type GameOverModel = {
  type: "GameOver"
  PlayerOne: UserId
  PlayerTwo: UserId
  moveTimeLimit: MoveTimeLimit
  columns: Columns
  gameOver: GameOver
  rematch: Rematch
}

type Rematch =
  | {
    type: "NotAsking"
  }
  | {
    type: "Asking"
    asker: PlayerType
  }

type GameOver =
  | {
    type: "Draw"
  }
  | {
    type: "Winner"
    winner: PlayerType
  }
  | {
    type: "Resignation"
    resigner: PlayerType
  }

export const toGameOver = (model: SharedModel): GameOver | { type: "None" } => {
  if (model.type === "Setup") {
    return { type: "None" }
  }

  const status = toStatus(model.columns)

  if (status.type === "Tie") {
    return { type: "Draw" }
  }

  if (status.type === "Winner") {
    return { type: "Winner", winner: status.winner }
  }

  return { type: "None" }
}

export type MoveTimeLimit = 5 | 7 | 9

export const allMoveTimeLimit: {
  [moveTimeLimit in MoveTimeLimit]: MoveTimeLimit
} = {
  "5": 5,
  "7": 7,
  "9": 9,
}

export const initShared = ({
  PlayerOne,
  PlayerTwo,
}: Pick<SharedModel, "PlayerOne" | "PlayerTwo">): SharedModel => {
  return {
    type: "Setup",
    moveTimeLimit: 7,
    PlayerOne,
    PlayerTwo,
  }
}

export type FrontendModel = SharedModel & {
  openedModal: "ConfirmResign" | "None"
  ghostIndex: ColumnIndex | "None"
}

export type BackendModel = SharedModel

//
//
//
// Msg
//
//
//

export type BackendMsg = Tick

export type FrontendMsg =
  | Req
  | ["HoveredOverColumns", { columnIndex: ColumnIndex }]
  | ["ClickedResign", { userId: UserId }]
  | ["CloseModal"]

export type ToBackend = Req

export type ToFrontend = Res | Tick_Done | ["PlayerLeft", SharedModel]

export type Req =
  // 
  | ["StopPlaying", { userId: UserId }]
  | ["StartPlaying", { userId: UserId; playerType: PlayerType }]
  | ["InputMoveTimeLimit", { userId: UserId; moveTimeLimit: MoveTimeLimit }]
  | ["InputMove", { columnIndex: ColumnIndex; userId: UserId }]
  | ["StartGame", { userId: UserId }]
  // 
  | ["Rematch_Request", { userId: UserId }]
  | ["Rematch_Respond", { userId: UserId; response: "Accept" | "Decline" }]
  | ["Rematch_Cancel", { userId: UserId }]
  // 
  | ["NewGame", { userId: UserId }]
  | ["Resign", { userId: UserId }]

export type Res = [Req[0], Result<Problem, SharedModel>]

export type Problem =
  | "not_playing"
  | "not_in_game"
  | "not_game_over"
  | "not_asking"
  | "not_in_setup"
  | "missing_player"
  | "player_taken"
  | MoveProblem
  | "already_asking"

export const handle = (
  req: Req,
  model: SharedModel,
): Result<Problem, SharedModel> => {
  switch (req[0]) {
    case "InputMove": {
      if (model.type !== "Game") {
        return Err("not_in_game")
      }
      const { userId, columnIndex } = req[1]

      const playerType = toPlayerType(userId, model)

      if (playerType === "None") {
        return Err("not_playing")
      }

      const result = move(model.columns, columnIndex, playerType)

      if (result.type === "Err") {
        return result
      }

      const modelNew = handleMoveResult(result, model)

      return Ok(modelNew)
    }

    case "StartPlaying": {
      if (model.type !== "Setup") {
        return Err("not_in_setup")
      }

      const { playerType, userId } = req[1]

      if (model[playerType] !== "None") {
        return Err("player_taken")
      }

      const modelNew: SharedModel = {
        ...model,
        [opposite[playerType]]:
          model[opposite[playerType]] === userId
            ? "None"
            : model[opposite[playerType]],
        [playerType]: userId,
      }

      return Ok(modelNew)
    }

    case "InputMoveTimeLimit": {
      if (model.type !== "Setup") {
        return Err("not_in_setup")
      }

      const { userId, moveTimeLimit } = req[1]

      const playerType = toPlayerType(userId, model)

      if (playerType === "None") {
        return Err("not_playing")
      }

      const modelNew: SharedModel = {
        ...model,
        moveTimeLimit,
      }

      return Ok(modelNew)
    }

    case "StopPlaying": {
      if (model.type !== "Setup") {
        return Err("not_in_setup")
      }

      const { userId } = req[1]

      const playerType = toPlayerType(userId, model)

      if (playerType === "None") {
        return Err("not_playing")
      }

      const modelNew: SharedModel = {
        ...model,
        [playerType]: "None",
      }

      return Ok(modelNew)
    }

    case "StartGame": {
      if (model.type !== "Setup") {
        return Err("not_in_setup")
      }

      if (model.PlayerOne === "None" || model.PlayerTwo === "None") {
        return Err("missing_player")
      }

      const modelNew: SharedModel = {
        type: "Game",
        columns: emptyColumns,
        moveTimeLimit: model.moveTimeLimit,
        moveCountDown: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
      }

      return Ok(modelNew)
    }

    case "Rematch_Request": {
      const { userId } = req[1]

      if (model.type !== "GameOver") {
        return Err("not_game_over")
      }

      if (model.rematch.type === "Asking") {
        return Err("already_asking")
      }

      const playerType = toPlayerType(userId, model)

      if (playerType === "None") {
        return Err("not_playing")
      }

      const modelNew: SharedModel = {
        ...model,
        rematch: { type: "Asking", asker: playerType },
      }

      return Ok(modelNew)
    }

    case "Rematch_Respond": {
      if (model.type !== "GameOver") {
        return Err("not_game_over")
      }

      if (model.rematch.type === "NotAsking") {
        return Err("not_asking")
      }

      const { response } = req[1]

      if (response === "Decline") {
        const modelNew: SharedModel = {
          ...model,
          rematch: { type: "NotAsking" },
        }

        return Ok(modelNew)
      }

      const modelNew: SharedModel = {
        type: "Game",
        columns: emptyColumns,
        moveCountDown: model.moveTimeLimit,
        moveTimeLimit: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
      }

      return Ok(modelNew)
    }

    case "NewGame": {
      if (model.type !== "GameOver") {
        return Err("not_game_over")
      }

      const { userId } = req[1]

      const playerType = toPlayerType(userId, model)

      if (playerType === "None") {
        return Err("not_playing")
      }

      const modelNew: SharedModel = {
        type: "Setup",
        moveTimeLimit: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
      }

      return Ok(modelNew)
    }

    case "Rematch_Cancel": {
      const { userId } = req[1]

      if (model.type !== "GameOver") {
        return Err("not_game_over")
      }

      const playerType = toPlayerType(userId, model)

      if (playerType === "None") {
        return Err("not_playing")
      }

      if (model.rematch.type !== "Asking") {
        return Err("not_asking")
      }

      if (model.rematch.asker !== playerType) {
        return Err("not_asking")
      }

      const modelNew: SharedModel = {
        ...model,
        rematch: { type: "NotAsking" },
      }

      return Ok(modelNew)
    }

    case "Resign": {
      if (model.type !== "Game") {
        return Err("not_in_game")
      }

      const { userId } = req[1]

      const playerType = toPlayerType(userId, model)

      if (playerType === "None") {
        return Err("not_playing")
      }

      const modelNew: SharedModel = {
        type: "GameOver",
        columns: model.columns,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
        rematch: { type: "NotAsking" },
        moveTimeLimit: model.moveTimeLimit,
        gameOver: { type: "Resignation", resigner: playerType },
      }

      return Ok(modelNew)
    }

    default: {
      return exhaustive(req[0])
    }
  }
}

export const toPlayerType = (
  userId: UserId,
  model: SharedModel,
): PlayerType | "None" => {
  if (model.PlayerOne === userId) {
    return "PlayerOne"
  }

  if (model.PlayerTwo === userId) {
    return "PlayerTwo"
  }

  return "None"
}

export const resultToString = (result: ReturnType<typeof handle>): string => {
  if (result.type === "Ok") {
    return ""
  }

  switch (result.error) {
    case "column_is_full": {
      return "Column is full"
    }

    case "game_over_winner": {
      return "Game is over"
    }

    case "game_over_tie": {
      return "Game is over"
    }

    case "missing_player": {
      return "Missing a player"
    }

    case "not_in_game": {
      return "Must be in game mode"
    }

    case "not_in_setup": {
      return "Must be in setup mode"
    }

    case "not_playing": {
      return "Must be playing to change"
    }

    case "not_turn": {
      return "Must be your turn"
    }

    case "out_of_bounds": {
      return "Out of bounds"
    }

    case "player_taken": {
      return "Player is taken"
    }

    case "not_game_over": {
      return "Must be in game over mode"
    }

    case "not_asking": {
      return "The other player is not asking for a rematch"
    }

    case "already_asking": {
      return "Already asking"
    }

    default: {
      return exhaustive(result.error)
    }
  }
}

//
//
//
//
//

type Tick = ["Tick"]
type Tick_Done = ["Tick_Done", SharedModel]

export const tick = (model: SharedModel): SharedModel => {
  if (model.type !== "Game") {
    return model
  }

  const moveCountDownNew = Math.floor(Math.max(0, model.moveCountDown - 1))

  if (moveCountDownNew > 0) {
    const modelNew: SharedModel = {
      ...model,
      moveCountDown: moveCountDownNew,
    }

    return modelNew
  }

  const turn = toTurn(model.columns)

  for (const columnIndex of shuffle(allColumnIndexes)) {
    const result = move(model.columns, columnIndex, turn)

    if (result.type === "Err") {
      continue
    }

    const modelNew = handleMoveResult(result, model)

    return modelNew
  }

  return model
}

const handleMoveResult = (
  result: MoveResult,
  model: GameModel,
): GameModel | GameOverModel => {
  if (result.type === "Err") {
    return model
  }

  const columnsNew = result.value

  const status = toStatus(columnsNew)

  if (status.type === "Playing") {
    const modelNew: SharedModel = {
      ...model,
      columns: columnsNew,
      moveCountDown: model.moveTimeLimit,
    }

    return modelNew
  }

  const gameOver: GameOver =
    status.type === "Winner"
      ? { type: "Winner", winner: status.winner }
      : { type: "Draw" }

  const modelNew: SharedModel = {
    type: "GameOver",
    moveTimeLimit: model.moveTimeLimit,
    PlayerOne: model.PlayerOne,
    PlayerTwo: model.PlayerTwo,
    columns: columnsNew,
    gameOver: gameOver,
    rematch: { type: "NotAsking" },
  }

  return modelNew
}

const shuffle = <X>(xs: X[]): X[] => {
  return [...xs].sort(() => (Math.random() > 0.5 ? -1 : 1))
}
