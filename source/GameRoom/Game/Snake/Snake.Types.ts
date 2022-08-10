import { Keyboard, Option } from "../../../Core"
import { UserId } from "../../../Data"
import { Direction, Position } from "../../../Games/Snake"

//
//
//
// Model
//
//
//

export type FrontendModel = SharedModel

export type BackendModel = SharedModel

export type SharedModel = {
  player: Player
  status: Status
  head: Position.Position
  tail: Position.Position[]
  food: Position.Position
  tailLength: number
  foodEatenCount: number
  tickRate: number
  direction: Direction.Direction
  directionQueue: Direction.Direction[]
  bounds: {
    lower: Position.Position
    upper: Position.Position
  }
  users: {
    [userId: UserId.UserId]: {
      userId: UserId.UserId
      mouseStatus: MouseStatus
      touched: Option.Option<Position.Position>
    }
  }
}

export type Player = { type: "User"; userId: UserId.UserId } | { type: "None" }

export type Status = { type: "Paused" } | { type: "Playing" }

export type MouseStatus = "active" | "inactive"

//
//
//
// Init
//
//
//

export const initGame: SharedModel = {
  player: { type: "None" },
  status: { type: "Paused" },
  tickRate: 1000 / 7,
  head: { x: 4, y: 6 },
  tail: [
    { x: 3, y: 6 },
    { x: 2, y: 6 },
  ],
  food: { x: 7, y: 6 },
  tailLength: 4,
  foodEatenCount: 0,
  direction: "right",
  directionQueue: [],
  bounds: {
    lower: {
      x: 0,
      y: 0,
    },
    upper: {
      x: 12,
      y: 21,
    },
  },
  users: {}
}

//
//
//
// Msg
//
//
//

export type FrontendMsg = | ["ClickedBack"]
| ["ClickedRestart"]
| ["ClickedToggle"]
| ["AudioFailed"]
| ["AudioSucceeded"]
| ["MouseDownBoard"]
| ["MouseUpBoard"]
| ["PressedKeyDown", Keyboard.Key]
| ["MouseMovedBoard", Position.Position]
| ["TouchMoveBoard", Position.Position]

export type BackendMsg = ["Tick"]

export type ToBackend = ["ChangeDirection", Direction.Direction]

export type ToFrontend = ["Sync", SharedModel]
