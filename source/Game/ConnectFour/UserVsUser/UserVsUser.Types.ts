import { Err, Ok, Result } from "../../../Core/Result"
import { UserId } from "../../../Data/UserId"
import { ColumnIndex, Columns, emptyColumns, move, MoveProblem, opposite, PlayerType } from "../ConnectFour"

//
//
//
// Model
//
//
//

export type SharedModel =
  | GameModel
  | SetupModel

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

export type MoveTimeLimit = 5 | 7 | 9

export const moveTimeLimit: {
  [moveTimeLimit in MoveTimeLimit]: MoveTimeLimit
} = {
  "5": 5,
  "7": 7,
  "9": 9,
}

export const moveTimeLimitToString = (timeLimit: MoveTimeLimit): string => {
  switch (timeLimit) {
    case 5: {
      return "5 sec"
    }

    case 7: {
      return "7 sec"
    }

    case 9: {
      return "9 sec"
    }
  }
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
  openedModal: "ConfirmResign" | "None"
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

export type FrontendMsg = Req

export type ToBackend = Req

export type ToFrontend = Res

export type Req =
  | ['StopPlaying', { userId: UserId, }]
  | ['StartPlaying', { userId: UserId, playerType: PlayerType }]
  | ['StartGame', { userId: UserId }]
  | ['InputMove', { columnIndex: ColumnIndex, userId: UserId }]

export type Res =
  | ['StopPlaying_Done', Result<"not_in_setup" | "not_playing", SharedModel>]
  | ['StartPlaying_Done', Result<"not_in_setup" | "player_taken", SharedModel>]
  | ['StartGame_Done', Result<"not_in_setup" | "missing_player", SharedModel>]
  | ['InputMove_Done', Result<"not_in_game" | "not_playing" | MoveProblem, SharedModel>]

export const handle = (req: Req, model: SharedModel): Res => {
  switch (req[0]) {

    case 'InputMove': {
      if (model.type !== 'Game') {
        return ['InputMove_Done', Err("not_in_game")]
      }
      const { userId, columnIndex } = req[1]

      const playerType: PlayerType | "None" = model.PlayerOne === userId ? 'PlayerOne' : model.PlayerTwo === userId ? 'PlayerTwo' : "None"

      if (playerType === 'None') {
        return ['InputMove_Done', Err("not_playing")]
      }

      const result = move(model.columns, columnIndex, playerType)

      if (result.type === 'Err') {
        return ['InputMove_Done', result]
      }

      const columnsNew = result.value

      const modelNew: SharedModel = {
        ...model,
        columns: columnsNew
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

    case 'StopPlaying': {
      if (model.type !== 'Setup') {
        return ['StopPlaying_Done', Err("not_in_setup")]
      }

      const { userId } = req[1]

      const playerType: PlayerType | "None" = model.PlayerOne === userId ? 'PlayerOne' : model.PlayerTwo === userId ? "PlayerTwo" : "None"

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
  }
}





