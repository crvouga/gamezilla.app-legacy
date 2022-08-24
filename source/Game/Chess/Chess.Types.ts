import { Audio, Browser, Option, Result } from "../../Core"
import { UserId } from "../../Data"
import * as Board from "./Board"

//
//
//
// Model
//
//
//

export type SharedModel =
  | {
      type: "GameSetup"
      White: Option.Option<UserId.UserId>
      Black: Option.Option<UserId.UserId>
      clockPreset: ClockPreset
    }
  | {
      type: "GameStarted"
      White: UserId.UserId
      Black: UserId.UserId
      clock: Clock
      board: Board.Model
    }

export type FrontendModel = {
  sharedModel: SharedModel
  openedMenuId: Option.Option<string>
}

export type BackendModel = SharedModel

export type Player = ["User", { userId: UserId.UserId }] | ["None"]

//
//
//
// Init
//
//
//

export const initSharedModel: SharedModel = {
  type: "GameSetup",
  Black: Option.None,
  White: Option.None,
  clockPreset: "Fast",
}

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["AudioResulted", Audio.PlayResult]
  | ["OpenedMenu", string]
  | ["ClosedMenu"]
  | Request

export type BackendMsg = ["Tick"]

export type ToFrontend = ["Sync", SharedModel] | Response

export type ToBackend = ["Init"] | Request

//
//
//
//
//
//

export type Request = Move | InputPlayer | StartGame | InputClock

export type Response =
  | MoveResulted
  | InputPlayerResulted
  | StartGameResulted
  | InputClockResulted

//
//
//

export type Move = ["Move", Board.MoveInput & { userId: UserId.UserId }]
export type MoveResulted = ["MovedResulted", MoveResult]
export type MoveResult = Result.Result<MoveProblem, SharedModel>
export type MoveProblem =
  | Board.MoveProblem
  | "game_must_be_started"
  | "user_must_be_a_player"

export const move = (
  { userId, ...moveInput }: Move[1],
  model: SharedModel,
): MoveResult => {
  if (model.type !== "GameStarted") {
    return Result.Err("game_must_be_started")
  }

  if (model.White !== userId && model.Black !== userId) {
    return Result.Err("user_must_be_a_player")
  }

  const result = Board.move(moveInput, model.board)

  if (result.type === "Err") {
    return result
  }

  const modelNew: SharedModel = {
    ...model,
    board: result.value,
  }

  return Result.Ok(modelNew)
}

//
//
//

export type InputPlayer = [
  "InputPlayer",
  {
    playerType: Board.PlayerType
    userId: Option.Option<UserId.UserId>
  },
]
export type InputPlayerResulted = [
  "InputPlayerResulted",
  Result.Result<InputPlayerProblem, SharedModel>,
]
export type InputPlayerProblem =
  | "game_must_be_in_setup_mode"
  | "player_is_taken"

export const inputPlayer = (
  { userId, playerType }: InputPlayer[1],
  model: SharedModel,
): InputPlayerResulted[1] => {
  if (model.type !== "GameSetup") {
    return Result.Err("game_must_be_in_setup_mode")
  }

  const player = playerType === "White" ? model.White : model.Black

  if (player.type !== "None" && userId.type === "Some") {
    return Result.Err("player_is_taken")
  }

  switch (playerType) {
    case "Black": {
      return Result.Ok({ ...model, Black: userId })
    }

    case "White": {
      return Result.Ok({ ...model, White: userId })
    }
  }
}

//
//
//
//
//
//

export type InputClock = ["InputClock", ClockPreset]

export type InputClockResulted = [
  "InputClockResulted",
  Result.Result<InputtedClockProblem, SharedModel>,
]

export type InputtedClockProblem = "failed_to_input_clock"

export const inputClock = (
  clockPreset: InputClock[1],
  model: SharedModel,
): InputClockResulted[1] => {
  if (model.type === "GameSetup") {
    return Result.Ok({
      ...model,
      clockPreset,
    })
  }

  return Result.Err("failed_to_input_clock")
}

//
//
//
//

export type StartGame = ["StartGame"]
export type StartGameResulted = ["StartGameResulted", StartGameResult]
export type StartGameProblem = "can_not_start_game"
export type StartGameResult = Result.Result<StartGameProblem, SharedModel>

export const canStartGame = (model: SharedModel): boolean => {
  return (
    model.type === "GameSetup" &&
    model.White.type === "Some" &&
    model.Black.type === "Some"
  )
}

export const startGame = (model: SharedModel): StartGameResult => {
  if (
    model.type === "GameSetup" &&
    model.White.type === "Some" &&
    model.Black.type === "Some"
  ) {
    return Result.Ok({
      type: "GameStarted",
      White: model.White.value,
      Black: model.Black.value,
      clock: toClock(model.clockPreset),
      board: Board.init(),
    })
  }

  return Result.Err("can_not_start_game")
}

//
//
//
// Clock
//
//
//

export type Clock = {
  White: Seconds
  Black: Seconds
}

export const decrementClock = (key: keyof Clock, clock: Clock): Clock => {
  return {
    ...clock,
    [key]: toSeconds(Math.max(0, clock[key] - 1)),
  }
}

export type Seconds = number & { _type: "Seconds" }

export const toSeconds = (seconds: number): Seconds => {
  return seconds as Seconds
}

export const subtract = (a: Seconds, b: Seconds): Seconds => {
  return toSeconds(a - b)
}

type ClockPreset = "Bullet" | "Blitz" | "Fast"

export const clockPresets: { [key in ClockPreset]: ClockPreset } = {
  Bullet: "Bullet",
  Blitz: "Blitz",
  Fast: "Fast",
}

export const presetToSeconds: { [key in ClockPreset]: Seconds } = {
  Bullet: toSeconds(60 * 1),
  Blitz: toSeconds(60 * 3),
  Fast: toSeconds(60 * 10),
}

export const toClock = (preset: ClockPreset): Clock => {
  const seconds = presetToSeconds[preset]
  return {
    White: seconds,
    Black: seconds,
  }
}

export const clockPresetToString = (preset: ClockPreset): string => {
  const minutes = presetToSeconds[preset] / 60

  return `${minutes} min`
}
