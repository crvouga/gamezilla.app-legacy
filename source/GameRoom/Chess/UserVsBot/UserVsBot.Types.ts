import { Audio, Option } from "../../../Core"
import { UserId } from "../../../Data"
import * as Board from "../Board"

//
//
//
// Model
//
//
//

export type FrontendModel = {
  sharedModel: SharedModel
  openedMenuId: Option.Option<string>
  openedModal: "None"
  isFlipped: boolean
}

export type BackendModel = SharedModel

export type SharedModel = SetupModel | GameModel | GameOverModel

export type SetupModel = {
  type: "Setup"
  userColor: Board.Color,
  userId: Option.Option<UserId.UserId>
}

export type GameModel = {
  type: "Game"
  userColor: Board.Color,
  userId: Option.Option<UserId.UserId>
  board: Board.Model
}

export type GameOverModel = {
  type: "GameOver"
  gameOver: GameOver
  userColor: Board.Color,
  userId: Option.Option<UserId.UserId>
  board: Board.Model
}

export type GameOver =
  | {
    type: "Resignation"
    resigner: Board.Color
  }
  | {
    type: "Checkmate"
    winner: Board.Color
  }
  | {
    type: "Stalemate"
  }

export const initShared: SharedModel = {
  type: "Setup",
  userColor: "b",
  userId: Option.None
}

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["Audio_Done", Audio.PlayResult]
  | ["OpenedMenu", string]


export type BackendMsg = ["None"]

export type ToFrontend = ["Sync", SharedModel] | ["GameOver"]

export type ToBackend = ["Init"] 
