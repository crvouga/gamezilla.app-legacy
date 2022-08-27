import { Option } from "../../../Core"
import { UserId } from "../../../Data"
import * as Board from "../Board"

//
//
//
// Model
//
//
//

export type Model = SetupModel | GameModel

export type SetupModel = {
  type: "Setup"
  user: Option.Option<UserId.UserId>
  computerColor: Board.Color
}

export type GameModel = {
  type: "Game"
  user: UserId.UserId
  computerColor: Board.Color
  board: Board.Model
}

//
//
//
// Msg
//
//
//
