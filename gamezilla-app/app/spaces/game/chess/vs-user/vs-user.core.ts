import { eq, isErr, Option, Result } from "gamezilla-app/@SHARED/core"
import { UserId } from "gamezilla-app/app/@SHARED/data"
import { Chess } from "../@SHARED/chess"
import * as Clock from "../@SHARED/chess/chess-clock"

const { Ok: Ok, Err: Err } = Result

//
//
//
// Model
//
//
//

export type ModelClient = {
  coreModel: CoreModel
  openedMenuId: Option<string>
  openedModal: Modal | "none"
  isFlipped: boolean
}

export type Modal = "RequestToDraw" | "AskedToDraw" | "resign" | "game-over"

export type ModelServer = CoreModel

export type CoreModel =
  | {
      type: "setup"
      clockPreset: Clock.Preset
      w: UserId | "none"
      b: UserId | "none"
    }
  | {
      type: "game"
      drawAgreement: DrawAgreement
      w: UserId
      b: UserId
      clock: Clock.Clock
      board: Chess.Model
    }
  | {
      type: "game-over"
      gameOver: GameOver
      w: UserId
      b: UserId
      clock: Clock.Clock
      board: Chess.Model
    }

export type DrawAgreement =
  | {
      type: "NotAsking"
    }
  | {
      type: "Asking"
      asker: Chess.Color
    }

export type GameOver =
  | Chess.GameOver
  | {
      type: "resignation"
      resigner: Chess.Color
    }
  | {
      type: "DrawByAgreement"
    }
  | {
      type: "WinOnTime"
      winner: Chess.Color
    }

export const initCore = ({
  userId,
}: {
  userId: UserId | "none"
}): CoreModel => {
  return {
    type: "setup",
    w: userId,
    b: "none",
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

export type MsgClient =
  | ["OpenedMenu", string]
  | ["ClosedMenu"]
  | ["OpenedModal", Modal]
  | ["ClosedModal"]
  | ["ClickedFlip"]
  | Req

export type MsgServer = ClockTicked

export type MsgToClient =
  | ["game-over"]
  | ["GameStarted"]
  | ["player-left", CoreModel]
  | ClockTicked_Done
  | Res

export type MsgToServer = Req

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

export type InputMove = ["input-move", Chess.MoveInput & { userId: UserId }]

export type InputMove_Done = [
  "input-move-done",
  Result<MoveProblem, CoreModel & { didCapture: boolean }>,
]

export type MoveProblem =
  | Chess.MoveProblem
  | "game_must_be_started"
  | "user_must_be_a_player"

export const inputMove = (
  { userId, ...moveInput }: InputMove[1],
  model: CoreModel,
): InputMove_Done[1] => {
  if (model.type !== "game") {
    return Err("game_must_be_started")
  }

  if (model.w !== userId && model.b !== userId) {
    return Err("user_must_be_a_player")
  }

  const result = Chess.move(moveInput, model.board)

  if (isErr(result)) {
    return result
  }

  const boardNew = result.value

  const gameOver = Chess.toGameOver(boardNew)

  if (gameOver.type !== "none") {
    const modelNew: CoreModel = {
      type: "game-over",
      b: model.b,
      w: model.w,
      board: boardNew,
      clock: model.clock,
      gameOver: gameOver,
    }

    return Ok({
      ...modelNew,
      didCapture: boardNew.didCapture,
    })
  }

  const modelNew: CoreModel = {
    ...model,
    board: boardNew,
  }

  return Ok({
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
    color: Chess.Color
    userId: UserId | "none"
  },
]

export type InputPlayer_Done = [
  "InputPlayer_Done",
  Result<InputPlayerProblem, CoreModel>,
]

export type InputPlayerProblem =
  | "game_must_be_in_setup_mode"
  | "player_is_taken"
  | "must_be_playing"

export const inputPlayer = (
  { userId, color }: InputPlayer[1],
  model: CoreModel,
): InputPlayer_Done[1] => {
  if (model.type !== "setup") {
    return Err("game_must_be_in_setup_mode")
  }

  const targetPlayer = userId
  const targetColor = color

  if (model[targetColor] !== "none" && targetPlayer !== "none") {
    return Err("player_is_taken")
  }

  const otherColor = Chess.toOppositeColor(color)
  const otherPlayer = model[otherColor]

  const otherPlayerNew =
    otherPlayer !== "none" &&
    targetPlayer !== "none" &&
    otherPlayer === targetPlayer
      ? "none"
      : otherPlayer

  return Ok({
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
  Result<InputClockProblem, CoreModel>,
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
  model: CoreModel,
): InputClock_Done[1] => {
  if (model.type !== "setup") {
    return Err("must_be_in_setup_mode")
  }

  const someUserId = Option.Some(userId)

  if (!eq(someUserId, model.b) && !eq(someUserId, model.w)) {
    return Err("must_be_playing")
  }

  return Ok({
    ...model,
    clockPreset,
  })
}

//
//
//
//

export type StartGame = ["start-game", { userId: UserId }]
export type StartGame_Done = [
  "StartGame_Done",
  Result<StartGameProblem, CoreModel>,
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
  model: CoreModel,
): StartGame_Done[1] => {
  if (model.type !== "setup") {
    return Err("game_not_in_setup_mode")
  }

  if (model.w === "none" && model.b === "none") {
    return Err("missing_both_players")
  }

  if (model.w === "none") {
    return Err("missing_white_player")
  }

  if (model.b === "none") {
    return Err("missing_black_player")
  }

  if (userId !== model.b && userId !== model.w) {
    return Err("must_be_a_player")
  }

  return Ok({
    type: "game",
    w: model.w,
    b: model.b,
    board: Chess.init(),
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

export type RequestToDraw = ["RequestToDraw", Chess.Color]
export type RequestToDraw_Done = [
  "RequestToDraw_Done",
  Result<"game_must_be_started", CoreModel>,
]

export const requestToDraw = (
  color: Chess.Color,
  model: CoreModel,
): RequestToDraw_Done[1] => {
  if (model.type !== "game") {
    return Err("game_must_be_started")
  }

  const modelNew: CoreModel = {
    ...model,
    drawAgreement: {
      type: "Asking",
      asker: color,
    },
  }
  return Ok(modelNew)
}

export type RespondToDraw = ["RespondToDraw", "Accepted" | "Declined"]
export type RespondToDraw_Done = [
  "RespondToDraw_Done",
  Result<"failed_to_respond_to_draw", CoreModel>,
]

export const respondToDraw = (
  drawResponse: RespondToDraw[1],
  model: CoreModel,
): RespondToDraw_Done[1] => {
  if (model.type !== "game") {
    return Err("failed_to_respond_to_draw")
  }

  if (!(model.drawAgreement.type === "Asking")) {
    return Err("failed_to_respond_to_draw")
  }

  if (drawResponse === "Declined") {
    const modelNew: CoreModel = {
      ...model,
      drawAgreement: { type: "NotAsking" },
    }
    return Ok(modelNew)
  }

  const modelNew: CoreModel = {
    type: "game-over",
    b: model.b,
    w: model.w,
    board: model.board,
    clock: model.clock,
    gameOver: {
      type: "DrawByAgreement",
    },
  }

  return Ok(modelNew)
}

export type CancelDraw = ["CancelDraw", { userId: UserId }]
export type CancelDraw_Done = [
  "CancelDraw_Done",
  Result<CancelDrawProblem, CoreModel>,
]
export type CancelDrawProblem =
  | "must_be_in_game_mode"
  | "must_be_asking_for_a_draw"
  | "must_be_the_one_asking"
  | "must_be_playing"

export const cancelDraw = (
  { userId }: CancelDraw[1],
  model: CoreModel,
): CancelDraw_Done[1] => {
  if (model.type !== "game") {
    return Err("must_be_in_game_mode")
  }

  if (model.drawAgreement.type === "NotAsking") {
    return Err("must_be_asking_for_a_draw")
  }

  const color: Chess.Color | "none" =
    model.b === userId ? "b" : model.w === userId ? "w" : "none"

  if (color === "none") {
    return Err("must_be_playing")
  }

  if (model.drawAgreement.asker !== color) {
    return Err("must_be_the_one_asking")
  }

  const modelNew: CoreModel = {
    ...model,
    drawAgreement: {
      type: "NotAsking",
    },
  }

  return Ok(modelNew)
}

//
//
//
// Resign
//
//
//

export type Resign = ["resign", Chess.Color]
export type Resign_Done = ["resign_Done", Result<"can_not_resign", CoreModel>]

export const resign = (color: Resign[1], model: CoreModel): Resign_Done[1] => {
  if (model.type !== "game") {
    return Err("can_not_resign")
  }

  const modelNew: CoreModel = {
    type: "game-over",
    b: model.b,
    w: model.w,
    board: model.board,
    clock: model.clock,
    gameOver: {
      type: "resignation",
      resigner: color,
    },
  }

  return Ok(modelNew)
}

//
//
//
//

export type NewGame = ["NewGame"]
export type NewGame_Done = [
  "NewGame_Done",
  Result<"game_must_be_over", CoreModel>,
]
export const NewGame = (model: CoreModel): NewGame_Done[1] => {
  if (model.type !== "game-over") {
    return Err("game_must_be_over")
  }

  const modelNew: CoreModel = {
    type: "setup",
    b: model.b,
    w: model.w,
    clockPreset: model.clock.preset,
  }

  return Ok(modelNew)
}

//
//
//
//
//

export type ClockTicked = ["ClockTicked"]
export type ClockTicked_Done = ["ClockTicked", CoreModel]

export const clockTicked = (model: CoreModel): CoreModel => {
  if (model.type !== "game") {
    return model
  }

  const turn = Chess.toTurn(model.board)

  if (
    model.drawAgreement.type === "Asking" &&
    model.drawAgreement.asker !== turn
  ) {
    return model
  }

  const ticked = Clock.tick({ turn, clock: model.clock })

  if (ticked.type === "TimeIsUp") {
    const loser = ticked.timeIsUp

    return {
      type: "game-over",
      w: model.w,
      b: model.b,
      board: model.board,
      clock: ticked.clock,
      gameOver: {
        type: "WinOnTime",
        winner: Chess.toOppositeColor(loser),
      },
    }
  }

  return {
    ...model,
    clock: ticked.clock,
  }
}
