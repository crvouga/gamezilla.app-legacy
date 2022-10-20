import { exhaustive } from "../../../Core"
import { Err, Ok, Result } from "../../../Core/Result"
import { UserId } from "../../../Data/UserId"
import { ColumnIndex, Columns, emptyColumns, move, MoveProblem, opposite, PlayerType, toStatus } from "../ConnectFour"

//
//
//
// Model
//
//
//

export type SharedModel =
  | SetupModel
  | GameModel
  | GameOverModel

export type SetupModel = {
  type: "Setup"
  moveTimeLimit: MoveTimeLimit
  PlayerOne: UserId | "None"
  PlayerTwo: UserId | "None"
}

export type GameModel = {
  type: "Game",
  PlayerOne: UserId,
  PlayerTwo: UserId,
  moveTimeLimit: MoveTimeLimit,
  moveCountDown: number,
  columns: Columns
}

export type GameOverModel = {
  type: "GameOver",
  PlayerOne: UserId,
  PlayerTwo: UserId,
  moveTimeLimit: MoveTimeLimit,
  columns: Columns,
  gameOver: GameOver
}

type GameOver =
  | {
    type: "Draw"
  }
  | {
    type: "DrawByAgreement"
  }
  | {
    type: "Winner",
    winner: PlayerType
  }
  | {
    type: "Resignation",
    resigner: PlayerType
  }

export const toGameOver = (model: SharedModel): GameOver | { type: "None" } => {
  if (model.type === 'Setup') {
    return { type: "None" }
  }

  const status = toStatus(model.columns)

  if (status.type === 'Tie') {
    return { type: "Draw" }
  }

  if (status.type === 'Winner') {
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

export const initShared = ({ PlayerOne, PlayerTwo }: Pick<SharedModel, 'PlayerOne' | 'PlayerTwo'>): SharedModel => {
  return {
    type: "Setup",
    moveTimeLimit: 7,
    PlayerOne,
    PlayerTwo,
  }
}

export type FrontendModel = SharedModel & {
  openedModal: "ConfirmResign" | "None",
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

export type BackendMsg = ["None"]

export type FrontendMsg = Req | ["HoveredOverColumns", { columnIndex: ColumnIndex }]

export type ToBackend = Req

export type ToFrontend = Res

export type Req =
  | ['StopPlaying', { userId: UserId, }]
  | ['StartPlaying', { userId: UserId, playerType: PlayerType }]
  | ['InputMoveTimeLimit', { userId: UserId, moveTimeLimit: MoveTimeLimit }]
  | ['StartGame', { userId: UserId }]
  | ['InputMove', { columnIndex: ColumnIndex, userId: UserId }]
  | ["RematchRequest", { userId: UserId }]
  | ["RematchRespond", { userId: UserId, response: "Accept" | "Decline" }]

export type Res =
  | ['StopPlaying_Done', Result<"not_in_setup" | "not_playing", SharedModel>]
  | ['StartPlaying_Done', Result<"not_in_setup" | "player_taken", SharedModel>]
  | ['InputMoveTimeLimit_Done', Result<"not_in_setup" | "not_playing", SharedModel>]
  | ['StartGame_Done', Result<"not_in_setup" | "missing_player", SharedModel>]
  | ['InputMove_Done', Result<"not_in_game" | "not_playing" | MoveProblem, SharedModel>]
  | ["RematchRequest_Done", Result<"not_playing" | "not_game_over", SharedModel>]
  | ["RematchRespond_Done", Result<"not_playing" | "not_asking" | "not_game_over", SharedModel>]

export const handle = (req: Req, model: SharedModel): Res => {
  switch (req[0]) {
    case 'InputMove': {
      if (model.type !== 'Game') {
        return ['InputMove_Done', Err("not_in_game")]
      }
      const { userId, columnIndex } = req[1]

      const playerType = toPlayerType(userId, model)

      if (playerType === 'None') {
        return ['InputMove_Done', Err("not_playing")]
      }

      const result = move(model.columns, columnIndex, playerType)

      if (result.type === 'Err') {
        return ['InputMove_Done', result]
      }

      const columnsNew = result.value


      const status = toStatus(columnsNew)

      if (status.type === 'Playing') {
        const modelNew: SharedModel = {
          ...model,
          columns: columnsNew
        }

        return ['InputMove_Done', Ok(modelNew)]
      }

      const modelNew: SharedModel = {
        type: "GameOver",
        moveTimeLimit: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
        columns: columnsNew,
        gameOver: status.type === 'Winner' ? { type: "Winner", winner: status.winner } : { type: "Draw" }
      }

      return ['InputMove_Done', Ok(modelNew)]
    }

    case 'StartPlaying': {
      if (model.type !== 'Setup') {
        return ['StartPlaying_Done', Err("not_in_setup")]
      }

      const { playerType, userId } = req[1]

      if (model[playerType] !== 'None') {
        return ["StartPlaying_Done", Err("player_taken")]
      }

      const modelNew: SharedModel = {
        ...model,
        [opposite[playerType]]: model[opposite[playerType]] === userId ? "None" : model[opposite[playerType]],
        [playerType]: userId,
      }

      return ['StartPlaying_Done', Ok(modelNew)]
    }

    case 'InputMoveTimeLimit': {
      if (model.type !== 'Setup') {
        return ['InputMoveTimeLimit_Done', Err("not_in_setup")]
      }

      const { userId, moveTimeLimit } = req[1]

      const playerType = toPlayerType(userId, model)

      if (playerType === 'None') {
        return ['InputMoveTimeLimit_Done', Err("not_playing")]
      }

      const modelNew: SharedModel = {
        ...model,
        moveTimeLimit
      }

      return ['InputMoveTimeLimit_Done', Ok(modelNew)]
    }

    case 'StopPlaying': {
      if (model.type !== 'Setup') {
        return ['StopPlaying_Done', Err("not_in_setup")]
      }

      const { userId } = req[1]

      const playerType = toPlayerType(userId, model)

      if (playerType === "None") {
        return ["StopPlaying_Done", Err("not_playing")]
      }

      const modelNew: SharedModel = {
        ...model,
        [playerType]: "None"
      }

      return ['StopPlaying_Done', Ok(modelNew)]
    }

    case 'StartGame': {
      if (model.type !== 'Setup') {
        return ['StartGame_Done', Err("not_in_setup")]
      }

      if (model.PlayerOne === 'None' || model.PlayerTwo === 'None') {
        return ['StartGame_Done', Err("missing_player")]
      }

      const modelNew: SharedModel = {
        type: "Game",
        columns: emptyColumns,
        moveTimeLimit: model.moveTimeLimit,
        moveCountDown: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
      }

      return ['StartGame_Done', Ok(modelNew)]
    }

    case 'RematchRequest': {
      return ["RematchRequest_Done", Ok(model)]
    }

    case "RematchRespond": {
      return ["RematchRespond_Done", Ok(model)]
    }
  }
}

export const toPlayerType = (userId: UserId, model: SharedModel): PlayerType | "None" => {
  if (model.PlayerOne === userId) {
    return 'PlayerOne'
  }

  if (model.PlayerTwo === userId) {
    return 'PlayerTwo'
  }

  return 'None'
}

export const responseToString = (res: Res): string => {
  const result = res[1]

  if (result.type === 'Ok') {
    return ""
  }

  switch (result.error) {
    case 'column_is_full': {
      return "Column is full"
    }

    case 'game_over': {
      return "Game is over"
    }

    case 'missing_player': {
      return "Missing a player"
    }

    case 'not_in_game': {
      return "Must be in game mode"
    }

    case 'not_in_setup': {
      return "Must be in setup mode"
    }

    case "not_playing": {
      return "Must be playing to change"
    }

    case 'not_turn': {
      return "Must be your turn"
    }

    case 'out_of_bounds': {
      return "Out of bounds"
    }

    case 'player_taken': {
      return "Player is taken"
    }

    case 'not_game_over': {
      return "Must be in game over mode"
    }

    case 'not_asking': {
      return "The other player is not asking for a rematch"
    }

    default: {
      return exhaustive(result)
    }
  }
}