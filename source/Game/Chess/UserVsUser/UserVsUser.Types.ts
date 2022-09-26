import { Audio, isEqual, Option, Result } from "../../../Core"
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
  openedMenuId: Option.Option<string>
  openedModal: Modal | "None"
  isFlipped: boolean
}

export type Modal = "RequestToDraw" | "AskedToDraw" | "Resign" | "GameOver"

export type BackendModel = {
  sharedModel: SharedModel
}

export type SharedModel =
  | {
      type: "Setup"
      clockPreset: Clock.Preset
      w: Option.Option<UserId.UserId>
      b: Option.Option<UserId.UserId>
    }
  | {
      type: "Starting"
      clockPreset: Clock.Preset
      w: UserId.UserId
      b: UserId.UserId
      countDown: 3 | 2 | 1
    }
  | {
      type: "Game"
      drawAgreement: DrawAgreement
      w: UserId.UserId
      b: UserId.UserId
      clock: Clock.Clock
      board: Board.Model
    }
  | {
      type: "GameOver"
      gameOver: GameOver
      w: UserId.UserId
      b: UserId.UserId
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
  userId: Option.Option<UserId.UserId>
}): SharedModel => {
  return {
    type: "Setup",
    w: userId,
    b: Option.None,
    clockPreset: "Blitz",
  }
}

export const initBackend = ({
  userId,
}: {
  userId: Option.Option<UserId.UserId>
}): BackendModel => {
  return {
    sharedModel: initShared({ userId }),
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

export type BackendMsg = ClockTicked | CountDownElapsed

export type ToFrontend =
  | ["Sync", SharedModel]
  | ["GameOver"]
  | ["GameStarted"]
  | CountDownElapsed_Done
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
  | CancelStartGame
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
  | CancelStartGame_Done
  | CancelDraw_Done

//
//
//
//
//
//

export type InputMove = [
  "InputMove",
  Board.MoveInput & { userId: UserId.UserId },
]

export type InputMove_Done = [
  "InputMove_Done",
  Result.Result<MoveProblem, SharedModel & { didCapture: boolean }>,
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
    userId: Option.Option<UserId.UserId>
  },
]

export type InputPlayer_Done = [
  "InputPlayer_Done",
  Result.Result<InputPlayerProblem, SharedModel>,
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

  if (model[targetColor].type === "Some" && targetPlayer.type === "Some") {
    return Result.Err("player_is_taken")
  }

  const otherColor = Board.toOppositeColor(color)
  const otherPlayer = model[otherColor]

  const otherPlayerNew =
    otherPlayer.type === "Some" &&
    targetPlayer.type === "Some" &&
    otherPlayer.value === targetPlayer.value
      ? Option.None
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
  { clockPreset: Clock.Preset; userId: UserId.UserId },
]

export type InputClock_Done = [
  "InputClock_Done",
  Result.Result<InputClockProblem, SharedModel>,
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

  if (!isEqual(someUserId, model.b) && !isEqual(someUserId, model.w)) {
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

export type StartGame = ["StartGame", { userId: UserId.UserId }]
export type StartGame_Done = [
  "StartGame_Done",
  Result.Result<StartGameProblem, SharedModel>,
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

  if (model.w.type === "None" && model.b.type === "None") {
    return Result.Err("missing_both_players")
  }

  if (model.w.type === "None") {
    return Result.Err("missing_white_player")
  }

  if (model.b.type === "None") {
    return Result.Err("missing_black_player")
  }

  if (userId !== model.b.value && userId !== model.w.value) {
    return Result.Err("must_be_a_player")
  }

  return Result.Ok({
    type: "Starting",
    w: model.w.value,
    b: model.b.value,
    clockPreset: model.clockPreset,
    countDown: 3,
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
  Result.Result<"game_must_be_started", SharedModel>,
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
  Result.Result<"failed_to_respond_to_draw", SharedModel>,
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

export type CancelDraw = ["CancelDraw", { userId: UserId.UserId }]
export type CancelDraw_Done = [
  "CancelDraw_Done",
  Result.Result<CancelDrawProblem, SharedModel>,
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
  Result.Result<"can_not_resign", SharedModel>,
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
  Result.Result<"game_must_be_over", SharedModel>,
]
export const newGame = (model: SharedModel): NewGame_Done[1] => {
  if (model.type !== "GameOver") {
    return Result.Err("game_must_be_over")
  }

  const modelNew: SharedModel = {
    type: "Setup",
    b: Option.Some(model.b),
    w: Option.Some(model.w),
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

//
//
//
//
//

export type CountDownElapsed = ["CountDownElapsed"]
export type CountDownElapsed_Done = ["CountDownElapsed_Done", SharedModel]

export const countDownElapsed = (model: SharedModel): SharedModel => {
  if (model.type !== "Starting") {
    return model
  }

  const countDownNew = decrementCountDown(model.countDown)

  if (countDownNew === 0) {
    return {
      type: "Game",
      w: model.w,
      b: model.b,
      board: Board.init(),
      clock: Clock.presetToClock(model.clockPreset),
      drawAgreement: { type: "NotAsking" },
    }
  }

  return {
    ...model,
    countDown: countDownNew,
  }
}

export const decrementCountDown = (countDown: 3 | 2 | 1): 2 | 1 | 0 => {
  const countDownNew = countDown - 1

  if (countDownNew === 2 || countDownNew === 1 || countDownNew === 0) {
    return countDownNew
  }

  return 0
}

//
//
//
//
//

export type CancelStartGame = ["CancelStartGame", { userId: UserId.UserId }]
export type CancelStartGame_Done = [
  "CancelStartGame_Done",
  Result.Result<CancelStartGameProblem, SharedModel>,
  { userId: UserId.UserId },
]
export type CancelStartGameProblem =
  | "must_be_playing"
  | "must_be_in_starting_mode"

export const cancelStartProblemToString = (
  problem: CancelStartGameProblem,
): string => {
  switch (problem) {
    case "must_be_in_starting_mode": {
      return "Must be in starting mode"
    }

    case "must_be_playing": {
      return "Must be playing to cancel"
    }
  }
}

export const cancelStartGame = (
  { userId }: CancelStartGame[1],
  model: SharedModel,
): CancelStartGame_Done[1] => {
  if (model.type !== "Starting") {
    return Result.Err("must_be_in_starting_mode")
  }

  if (model.w !== userId && model.b !== userId) {
    return Result.Err("must_be_playing")
  }

  const modelNew: SharedModel = {
    type: "Setup",
    b: Option.Some(model.b),
    w: Option.Some(model.w),
    clockPreset: model.clockPreset,
  }

  return Result.Ok(modelNew)
}
