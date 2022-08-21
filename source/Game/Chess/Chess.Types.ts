import * as ChessTs from "chess.ts"
import { Audio, Browser, Option, RemoteData, Result, Unit } from "../../Core"
import { UserId } from "../../Data"

//
//
//
// Chess
//
//
//

export const getInitialFen = () => {
  return new ChessTs.Chess().fen()
}

export const fenToBoard = (fen: string) => {
  return new ChessTs.Chess(fen).board()
}

export const move = (
  moveData: ChessTs.PartialMove,
  model: SharedModel,
): MoveResult => {
  const chess = new ChessTs.Chess(model.fen)

  const moved = chess.move(moveData)

  if (!moved) {
    return Result.Err("invalid_move")
  }

  const modelNew: SharedModel = {
    ...model,
    fen: chess.fen(),
  }

  return Result.Ok(modelNew)
}

export const inCheck = (model: SharedModel): boolean => {
  return new ChessTs.Chess(model.fen).inCheck()
}

export const inDraw = (model: SharedModel): boolean => {
  return new ChessTs.Chess(model.fen).inDraw()
}

export const inCheckmate = (model: SharedModel): boolean => {
  return new ChessTs.Chess(model.fen).inCheckmate()
}

export const inStalemate = (model: SharedModel): boolean => {
  return new ChessTs.Chess(model.fen).inStalemate()
}

export type PlayerType = "White" | "Black"

//
//
//
// Model
//
//
//

export type SharedModel = {
  fen: string
  mode: Mode
}

export type Mode =
  | [
      "GameSetup",
      {
        White: Option.Option<UserId.UserId>
        Black: Option.Option<UserId.UserId>
        clockPreset: ClockPreset
      },
    ]
  | [
      "GameStarted",
      {
        White: UserId.UserId
        Black: UserId.UserId
        clock: Clock
      },
    ]

export type Clock = {
  White: Seconds
  Black: Seconds
}

export type Seconds = number & { _type: "Seconds" }

export const toSeconds = (seconds: number): Seconds => {
  return seconds as Seconds
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

export type Player = ["User", { userId: UserId.UserId }] | ["None"]

export type FrontendModel = SharedModel & {
  boardWidth: number
  startGame: RemoteData.RemoteData<StartGameProblem, Unit>
  playAs: RemoteData.RemoteData<PlayAsProblem, Unit>
  stopPlaying: RemoteData.RemoteData<StopPlayingProblem, Unit>
  menu: ["Closed"] | ["Opened", { menuId: string }]
}

export type BackendModel = SharedModel

//
//
//
// Init
//
//
//

export const initSharedModel: SharedModel = {
  fen: getInitialFen(),
  mode: [
    "GameSetup",
    {
      Black: Option.None,
      White: Option.None,
      clockPreset: "Fast",
    },
  ],
}

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["GetElementResulted", Browser.GetElementByIdResult]
  | ["BrowserResized", Browser.Resize]
  | ["AudioResulted", Audio.PlayResult]
  | ["PressedPlayerSlot", PlayerType]
  | ["ClosedMenu"]
  | Request

export type BackendMsg = ["None"]

export type ToFrontend = ["Sync", SharedModel] | Response

export type ToBackend = Request

//
//
//
//
//
//

export type Request = Move | PlayAs | StopPlaying | StartGame | InputClock

export type Response =
  | MoveResulted
  | PlayAsResulted
  | StopPlayingResulted
  | StartGameResulted
  | InputtedClock

//
//
//

export type Move = ["Move", ChessTs.PartialMove & { userId: UserId.UserId }]
export type MoveResulted = ["MovedResulted", MoveResult]
export type MoveResult = Result.Result<"invalid_move", SharedModel>

//
//
//

export type PlayAs = [
  "PlayAs",
  { userId: UserId.UserId; playerType: PlayerType },
]
export type PlayAsResulted = ["PlayAsResulted", PlayAsResult]
export type PlayAsProblem = "game_must_be_in_setup_mode" | "player_is_taken"
export type PlayAsResult = Result.Result<PlayAsProblem, SharedModel>

export const playAs = (
  { userId, playerType }: PlayAs[1],
  model: SharedModel,
): PlayAsResult => {
  if (model.mode[0] !== "GameSetup") {
    return Result.Err("game_must_be_in_setup_mode")
  }

  const playerId = model.mode[1][playerType]

  if (playerId.type === "Some") {
    return Result.Err("player_is_taken")
  }

  switch (playerType) {
    case "Black":
      return Result.Ok({
        ...model,
        mode: ["GameSetup", { ...model.mode[1], Black: Option.Some(userId) }],
      })

    case "White":
      return Result.Ok({
        ...model,
        mode: ["GameSetup", { ...model.mode[1], White: Option.Some(userId) }],
      })
  }
}

//
//
//
//
//

export type StopPlaying = [
  "StopPlaying",
  { userId: UserId.UserId; playerType: PlayerType },
]
export type StopPlayingResulted = ["StopPlayingResulted", StopPlayingResult]
export type StopPlayingResult = Result.Result<StopPlayingProblem, SharedModel>
export type StopPlayingProblem =
  | "game_must_be_in_setup_mode"
  | "player_is_not_playing"
  | "user_is_not_the_player"

export const stopPlaying = (
  { userId, playerType }: StopPlaying[1],
  model: SharedModel,
): StopPlayingResult => {
  if (model.mode[0] !== "GameSetup") {
    return Result.Err("game_must_be_in_setup_mode")
  }

  const playerId = model.mode[1][playerType]

  if (playerId.type === "None") {
    return Result.Err("player_is_not_playing")
  }

  if (playerId.value !== userId) {
    return Result.Err("user_is_not_the_player")
  }

  switch (playerType) {
    case "Black": {
      const modelNew: SharedModel = {
        ...model,
        mode: ["GameSetup", { ...model.mode[1], Black: Option.None }],
      }

      return Result.Ok(modelNew)
    }

    case "White": {
      const modelNew: SharedModel = {
        ...model,
        mode: ["GameSetup", { ...model.mode[1], White: Option.None }],
      }

      return Result.Ok(modelNew)
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

export type InputtedClock = [
  "InputtedClock",
  Result.Result<InputtedClockProblem, SharedModel>,
]

export type InputtedClockProblem = "failed_to_input_clock"

export const inputClock = (
  clockPreset: InputClock[1],
  model: SharedModel,
): InputtedClock[1] => {
  if (model.mode[0] === "GameSetup") {
    const modelNew: SharedModel = {
      ...model,
      mode: ["GameSetup", { ...model.mode[1], clockPreset }],
    }
    return Result.Ok(modelNew)
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
    model.mode[0] === "GameSetup" &&
    model.mode[1].White.type === "Some" &&
    model.mode[1].Black.type === "Some"
  )
}

export const startGame = (model: SharedModel): StartGameResult => {
  if (
    model.mode[0] === "GameSetup" &&
    model.mode[1].White.type === "Some" &&
    model.mode[1].Black.type === "Some"
  ) {
    const modelNew: SharedModel = {
      ...model,
      mode: [
        "GameStarted",
        {
          White: model.mode[1].White.value,
          Black: model.mode[1].Black.value,
          clock: toClock(model.mode[1].clockPreset),
        },
      ],
    }

    return Result.Ok(modelNew)
  }

  return Result.Err("can_not_start_game")
}
