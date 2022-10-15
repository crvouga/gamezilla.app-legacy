import { Err, Ok, Result } from "../../../Core/Result"
import { UserId } from "../../../Data"
import { Columns, PlayerType } from "../ConnectFour"

//
//
//
// Model
//
//
//

export type SharedModel =
  | {
    type: "Setup"
    moveTimeLimit: MoveTimeLimit
    PlayerOne: UserId.UserId | "None"
    PlayerTwo: UserId.UserId | "None"
  }
  | {
    type: "Game",
    PlayerOne: UserId.UserId,
    PlayerTwo: UserId.UserId,
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

export const initShared = ({ playerOne, playerTwo }: { playerOne: UserId.UserId | "None", playerTwo: UserId.UserId | "None" }): SharedModel => {
  return {
    type: "Setup",
    moveTimeLimit: 7,
    PlayerOne: playerOne,
    PlayerTwo: playerTwo,
  }
}

export type FrontendModel = SharedModel

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
  | ['StopPlaying', { userId: UserId.UserId, }]
  | ['StartPlaying', { userId: UserId.UserId, playerType: PlayerType }]

export type Res =
  | ['StopPlaying_Done', Result<"not_in_setup", SharedModel>]
  | ['StartPlaying_Done', Result<"not_in_setup" | "player_taken", SharedModel>]

export const handle = (req: Req, model: SharedModel): Res => {
  switch (req[0]) {
    case 'StartPlaying': {
      if (model.type !== 'Setup') {
        return ['StartPlaying_Done', Err("not_in_setup")]
      }
      const { playerType } = req[1]

      if (model[playerType] !== 'None') {
        return ["StartPlaying_Done", Err("player_taken")]
      }

      const modelNew: SharedModel = {
        ...model,
        type: "Setup",
        moveTimeLimit: model.moveTimeLimit,
      }

      return ['StartPlaying_Done', Ok(modelNew)]
    }

    case 'StopPlaying': {
      if (model.type !== 'Setup') {
        return ['StopPlaying_Done', Err("not_in_setup")]
      }

      const modelNew: SharedModel = {
        ...model,
        type: "Setup",
        moveTimeLimit: model.moveTimeLimit,
      }

      return ['StopPlaying_Done', Ok(modelNew)]
    }
  }
}





