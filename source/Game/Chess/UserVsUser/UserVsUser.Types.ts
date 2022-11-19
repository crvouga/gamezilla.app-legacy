import { Audio, eq, Option, Result } from "../../../Core"
import { UserId } from "../../../Data"
import * as Board from "../Board"
import * as Clock from "../Clock"

//
//
//
// Model
//
//
//

export type FrontendModel = {
  sharedModel: SharedModel
  openedMenuId: Option<string>
  openedModal: Modal | "None"
  isFlipped: boolean
}

export type Modal = "RequestToDraw" | "AskedToDraw" | "Resign" | "GameOver"

export type BackendModel = SharedModel

export type SharedModel =
  | {
    type: "Setup"
    clockPreset: Clock.Preset
    w: UserId | "None"
    b: UserId | "None"
  }
  | {
    type: "Game"
    drawAgreement: DrawAgreement
    w: UserId
    b: UserId
    clock: Clock.Clock
    board: Board.Model
  }
  | {
    type: "GameOver"
    gameOver: GameOver
    w: UserId
    b: UserId
    clock: Clock.Clock
    board: Board.Model
  }

export type DrawAgreement =
  | {
    type: "NotAsking"
  }
  | {
    type: "Asking"
    asker: Board.Color
  }

export type GameOver =
  | Board.GameOver
  | {
    type: "Resignation"
    resigner: Board.Color
  }
  | {
    type: "DrawByAgreement"
  }
  | {
    type: "WinOnTime"
    winner: Board.Color
  }

export const initShared = ({
  userId,
}: {
  userId: UserId | "None"
}): SharedModel => {
  return {
    type: "Setup",
    w: userId,
    b: "None",
    clockPreset: "Blitz",
  }
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
  | ["ClosedMenu"]
  | ["OpenedModal", Modal]
  | ["ClosedModal"]
  | ["ClickedFlip"]
  | Req

export type BackendMsg = ClockTicked

export type ToFrontend =
  | ["Sync", SharedModel]
  | ["GameOver"]
  | ["GameStarted"]
  | ['PlayerLeft', SharedModel]
  | ClockTicked_Done
  | Res

export type ToBackend = ["Init"] | Req

export type Req =
  | InputPlayer
  | InputClock
  | StartGame
  | InputMove
  | Resign
  | RequestToDraw
  | RespondToDraw
  | NewGame
  | CancelDraw

export type Res =
  | InputPlayer_Done
  | InputClock_Done
  | StartGame_Done
  | InputMove_Done
  | Resign_Done
  | RequestToDraw_Done
  | RespondToDraw_Done
  | NewGame_Done
  | CancelDraw_Done

//
//
//
//
//
//

export type InputMove = [
  "InputMove",
  Board.MoveInput & { userId: UserId },
]

export type InputMove_Done = [
  "InputMove_Done",
  Result<MoveProblem, SharedModel & { didCapture: boolean }>,
]

export type MoveProblem =
  | Board.MoveProblem
  | "game_must_be_started"
  | "user_must_be_a_player"

export const inputMove = (
  { userId, ...moveInput }: InputMove[1],
  model: SharedModel,
): InputMove_Done[1] => {
  if (model.type !== "Game") {
    return Result.Err("game_must_be_started")
  }

  if (model.w !== userId && model.b !== userId) {
    return Result.Err("user_must_be_a_player")
  }

  const result = Board.move(moveInput, model.board)

  if (result.type === "Err") {
    return result
  }

  const boardNew = result.value

  const gameOver = Board.toGameOver(boardNew)

  if (gameOver.type !== "None") {
    const modelNew: SharedModel = {
      type: "GameOver",
      b: model.b,
      w: model.w,
      board: boardNew,
      clock: model.clock,
      gameOver: gameOver,
    }

    return Result.Ok({
      ...modelNew,
      didCapture: boardNew.didCapture,
    })
  }

  const modelNew: SharedModel = {
    ...model,
    board: boardNew,
  }

  return Result.Ok({
    ...modelNew,
    didCapture: boardNew.didCapture,
  })
}

//
//
//

export type InputPlayer = [
  "InputPlayer",
  {
    color: Board.Color
    userId: UserId | "None"
  },
]

export type InputPlayer_Done = [
  "InputPlayer_Done",
  Result<InputPlayerProblem, SharedModel>,
]

export type InputPlayerProblem =
  | "game_must_be_in_setup_mode"
  | "player_is_taken"
  | "must_be_playing"

export const inputPlayer = (
  { userId, color }: InputPlayer[1],
  model: SharedModel,
): InputPlayer_Done[1] => {
  if (model.type !== "Setup") {
    return Result.Err("game_must_be_in_setup_mode")
  }

  const targetPlayer = userId
  const targetColor = color

  if (model[targetColor] !== "None" && targetPlayer !== "None") {
    return Result.Err("player_is_taken")
  }

  const otherColor = Board.toOppositeColor(color)
  const otherPlayer = model[otherColor]

  const otherPlayerNew =
    otherPlayer !== "None" &&
      targetPlayer !== "None" &&
      otherPlayer === targetPlayer
      ? "None"
      : otherPlayer

  return Result.Ok({
    ...model,
    [targetColor]: targetPlayer,
    [otherColor]: otherPlayerNew,
  })
}

//
//
//
//
//
//

export type InputClock = [
  "InputClock",
  { clockPreset: Clock.Preset; userId: UserId },
]

export type InputClock_Done = [
  "InputClock_Done",
  Result<InputClockProblem, SharedModel>,
]

export type InputClockProblem = "must_be_in_setup_mode" | "must_be_playing"

export const inputClockProblemToString = (
  problem: InputClockProblem,
): string => {
  switch (problem) {
    case "must_be_in_setup_mode": {
      return "Must be in setup mode"
    }

    case "must_be_playing": {
      return "Must be playing to change the clock"
    }
  }
}

export const inputClock = (
  { clockPreset, userId }: InputClock[1],
  model: SharedModel,
): InputClock_Done[1] => {
  if (model.type !== "Setup") {
    return Result.Err("must_be_in_setup_mode")
  }

  const someUserId = Option.Some(userId)

  if (!eq(someUserId, model.b) && !eq(someUserId, model.w)) {
    return Result.Err("must_be_playing")
  }

  return Result.Ok({
    ...model,
    clockPreset,
  })
}

//
//
//
//

export type StartGame = ["StartGame", { userId: UserId }]
export type StartGame_Done = [
  "StartGame_Done",
  Result<StartGameProblem, SharedModel>,
]
export type StartGameProblem =
  | "missing_white_player"
  | "missing_black_player"
  | "missing_both_players"
  | "game_not_in_setup_mode"
  | "must_be_a_player"

export const startGameProblemToString = (problem: StartGameProblem): string => {
  switch (problem) {
    case "must_be_a_player": {
      return "Must be playing to start the game"
    }

    case "game_not_in_setup_mode": {
      return "Game muse be in setup mode"
    }

    case "missing_black_player": {
      return "Missing black player"
    }

    case "missing_both_players": {
      return "Missing white and black players"
    }

    case "missing_white_player": {
      return "Missing white player"
    }
  }
}

export const startGame = (
  { userId }: StartGame[1],
  model: SharedModel,
): StartGame_Done[1] => {
  if (model.type !== "Setup") {
    return Result.Err("game_not_in_setup_mode")
  }

  if (model.w === "None" && model.b === "None") {
    return Result.Err("missing_both_players")
  }

  if (model.w === "None") {
    return Result.Err("missing_white_player")
  }

  if (model.b === "None") {
    return Result.Err("missing_black_player")
  }

  if (userId !== model.b && userId !== model.w) {
    return Result.Err("must_be_a_player")
  }

  return Result.Ok({
    type: "Game",
    w: model.w,
    b: model.b,
    board: Board.init(),
    clock: Clock.presetToClock(model.clockPreset),
    drawAgreement: { type: "NotAsking" },
  })
}

//
//
//
// Draw by agreement
//
//
//

export type RequestToDraw = ["RequestToDraw", Board.Color]
export type RequestToDraw_Done = [
  "RequestToDraw_Done",
  Result<"game_must_be_started", SharedModel>,
]

export const requestToDraw = (
  color: Board.Color,
  model: SharedModel,
): RequestToDraw_Done[1] => {
  if (model.type !== "Game") {
    return Result.Err("game_must_be_started")
  }

  const modelNew: SharedModel = {
    ...model,
    drawAgreement: {
      type: "Asking",
      asker: color,
    },
  }
  return Result.Ok(modelNew)
}

export type RespondToDraw = ["RespondToDraw", "Accepted" | "Declined"]
export type RespondToDraw_Done = [
  "RespondToDraw_Done",
  Result<"failed_to_respond_to_draw", SharedModel>,
]

export const respondToDraw = (
  drawResponse: RespondToDraw[1],
  model: SharedModel,
): RespondToDraw_Done[1] => {
  if (model.type !== "Game") {
    return Result.Err("failed_to_respond_to_draw")
  }

  if (!(model.drawAgreement.type === "Asking")) {
    return Result.Err("failed_to_respond_to_draw")
  }

  if (drawResponse === "Declined") {
    const modelNew: SharedModel = {
      ...model,
      drawAgreement: { type: "NotAsking" },
    }
    return Result.Ok(modelNew)
  }

  const modelNew: SharedModel = {
    type: "GameOver",
    b: model.b,
    w: model.w,
    board: model.board,
    clock: model.clock,
    gameOver: {
      type: "DrawByAgreement",
    },
  }

  return Result.Ok(modelNew)
}

export type CancelDraw = ["CancelDraw", { userId: UserId }]
export type CancelDraw_Done = [
  "CancelDraw_Done",
  Result<CancelDrawProblem, SharedModel>,
]
export type CancelDrawProblem =
  | "must_be_in_game_mode"
  | "must_be_asking_for_a_draw"
  | "must_be_the_one_asking"
  | "must_be_playing"

export const cancelDraw = (
  { userId }: CancelDraw[1],
  model: SharedModel,
): CancelDraw_Done[1] => {
  if (model.type !== "Game") {
    return Result.Err("must_be_in_game_mode")
  }

  if (model.drawAgreement.type === "NotAsking") {
    return Result.Err("must_be_asking_for_a_draw")
  }

  const color: Board.Color | "None" =
    model.b === userId ? "b" : model.w === userId ? "w" : "None"

  if (color === "None") {
    return Result.Err("must_be_playing")
  }

  if (model.drawAgreement.asker !== color) {
    return Result.Err("must_be_the_one_asking")
  }

  const modelNew: SharedModel = {
    ...model,
    drawAgreement: {
      type: "NotAsking",
    },
  }

  return Result.Ok(modelNew)
}

//
//
//
// Resign
//
//
//

export type Resign = ["Resign", Board.Color]
export type Resign_Done = [
  "Resign_Done",
  Result<"can_not_resign", SharedModel>,
]

export const resign = (
  color: Resign[1],
  model: SharedModel,
): Resign_Done[1] => {
  if (model.type !== "Game") {
    return Result.Err("can_not_resign")
  }

  const modelNew: SharedModel = {
    type: "GameOver",
    b: model.b,
    w: model.w,
    board: model.board,
    clock: model.clock,
    gameOver: {
      type: "Resignation",
      resigner: color,
    },
  }

  return Result.Ok(modelNew)
}

//
//
//
//

export type NewGame = ["NewGame"]
export type NewGame_Done = [
  "NewGame_Done",
  Result<"game_must_be_over", SharedModel>,
]
export const newGame = (model: SharedModel): NewGame_Done[1] => {
  if (model.type !== "GameOver") {
    return Result.Err("game_must_be_over")
  }

  const modelNew: SharedModel = {
    type: "Setup",
    b: model.b,
    w: model.w,
    clockPreset: model.clock.preset,
  }

  return Result.Ok(modelNew)
}

//
//
//
//
//

export type ClockTicked = ["ClockTicked"]
export type ClockTicked_Done = ["ClockTicked", SharedModel]

export const clockTicked = (model: SharedModel): SharedModel => {
  if (model.type !== "Game") {
    return model
  }

  const turn = Board.toTurn(model.board)

  if (
    model.drawAgreement.type === "Asking" &&
    model.drawAgreement.asker !== turn
  ) {
    return model
  }

  const result = Clock.tick({ turn, clock: model.clock })

  if (result.type === "TimeIsUp") {
    const loser = result.timeIsUp

    return {
      type: "GameOver",
      w: model.w,
      b: model.b,
      board: model.board,
      clock: result.clock,
      gameOver: {
        type: "WinOnTime",
        winner: Board.toOppositeColor(loser),
      },
    }
  }

  return {
    ...model,
    clock: result.clock,
  }
}

