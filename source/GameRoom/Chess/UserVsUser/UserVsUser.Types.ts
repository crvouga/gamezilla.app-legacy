import { Audio, Option, Result } from "../../../Core"
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

export type SharedModel = SetupModel | GameModel | GameOverModel

export type SetupModel = {
  type: "Setup"
  clockPreset: Clock.Preset
  w: Option.Option<UserId.UserId>
  b: Option.Option<UserId.UserId>
}

export type GameModel = {
  type: "Game"
  drawAgreement: DrawAgreement
  w: UserId.UserId
  b: UserId.UserId
  clock: Clock.Clock
  board: Board.Model
}

export type GameOverModel = {
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
  | {
    type: "Resignation"
    resigner: Board.Color
  }
  | {
    type: "DrawByAgreement"
  }
  | {
    type: "Checkmate"
    winner: Board.Color
  }
  | {
    type: "Stalemate"
  }
  | {
    type: "WinOnTime"
    winner: Board.Color
  }

export const initShared: SharedModel = {
  type: "Setup",
  b: Option.None,
  w: Option.None,
  clockPreset: "Blitz",
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
  | Request

export type BackendMsg = ["Tick"]

export type ToFrontend = ["Sync", SharedModel] | ["GameOver"] | Response

export type ToBackend = ["Init"] | Request

export type Request =
  | InputPlayer
  | InputClock
  | StartGame
  | Move
  | Resign
  | RequestToDraw
  | RespondToDraw
  | NewGame

export type Response =
  | InputPlayer_Done
  | InputClock_Done
  | StartGame_Done
  | Move_Done
  | Resign_Done
  | RequestToDraw_Done
  | RespondToDraw_Done
  | NewGame_Done

//
//
//
//
//
//

export type Move = ["Move", Board.MoveInput & { userId: UserId.UserId }]

export type Move_Done = [
  "Moved_Done",
  Result.Result<MoveProblem, SharedModel & { didCapture: boolean }>,
]

export type MoveProblem =
  | Board.MoveProblem
  | "game_must_be_started"
  | "user_must_be_a_player"

export const move = (
  { userId, ...moveInput }: Move[1],
  model: SharedModel,
): Move_Done[1] => {
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

  if (Board.inCheckmate(boardNew)) {
    const modelNew: SharedModel = {
      type: "GameOver",
      b: model.b,
      w: model.w,
      board: boardNew,
      clock: model.clock,
      gameOver: {
        type: "Checkmate",
        winner: Board.toTurn(model.board),
      },
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

export type InputClock = ["InputClock", Clock.Preset]

export type InputClock_Done = [
  "InputClock_Done",
  Result.Result<InputtedClockProblem, SharedModel>,
]

export type InputtedClockProblem = "failed_to_input_clock"

export const inputClock = (
  clockPreset: InputClock[1],
  model: SharedModel,
): InputClock_Done[1] => {
  if (model.type === "Setup") {
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

export type StartGame = ["StartGame", { userId: UserId.UserId }]
export type StartGame_Done = [
  "StartGame_Done",
  Result.Result<StartGameProblem, SharedModel>,
]
export type StartGameProblem = "missing_white_player" | "missing_black_player" | "missing_both_players" | "game_not_in_setup_mode" | "must_be_a_player"

export const startGameProblemToString = (problem: StartGameProblem): string => {
  switch (problem) {

    case 'must_be_a_player': {
      return "Must be a player to start the game"
    }

    case 'game_not_in_setup_mode': {
      return "Game is not in setup mode"
    }

    case 'missing_black_player': {
      return "Missing black player"
    }

    case 'missing_both_players': {
      return "Missing white and black players"
    }

    case 'missing_white_player': {
      return "Missing white player"
    }
  }
}

export const startGame = ({ userId }: StartGame[1], model: SharedModel): StartGame_Done[1] => {
  if (model.type !== 'Setup') {
    return Result.Err("game_not_in_setup_mode")
  }

  if (model.w.type === 'None' && model.b.type === 'None') {
    return Result.Err("missing_both_players")
  }

  if (model.w.type === 'None') {
    return Result.Err("missing_white_player")
  }

  if (model.b.type === 'None') {
    return Result.Err("missing_black_player")
  }

  if (userId !== model.b.value && userId !== model.w.value) {
    return Result.Err("must_be_a_player")
  }

  return Result.Ok({
    type: "Game",
    w: model.w.value,
    b: model.b.value,
    clock: Clock.presetToClock(model.clockPreset),
    board: Board.init(),
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
    clockPreset: "Fast",
  }

  return Result.Ok(modelNew)
}

//
//
//
//
//

export const clockTicked = (model: SharedModel): SharedModel => {
  switch (model.type) {
    case "Setup": {
      return model
    }

    case "GameOver": {
      return model
    }

    case "Game": {
      const turn = Board.toTurn(model.board)

      if (
        model.drawAgreement.type === "Asking" &&
        model.drawAgreement.asker !== turn
      ) {
        return model
      }

      const clockNew = Clock.decrement(turn, model.clock)

      if (clockNew[turn] === 0) {
        return {
          type: "GameOver",
          w: model.w,
          b: model.b,
          board: model.board,
          clock: clockNew,
          gameOver: {
            type: "WinOnTime",
            winner: Board.toOppositeColor(turn),
          },
        }
      }

      return {
        ...model,
        clock: clockNew,
      }
    }
  }
}
