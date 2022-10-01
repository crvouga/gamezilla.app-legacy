import { Err, Ok, Result } from "../../../Core/Result"
import { UserId } from "../../../Data"
import { Board, emptyBoard, move, MoveProblem, PlayerType, Position, toOpposite, toTurn } from "../TicTacToe"


// 
// 
// 
// Model
// 
// 
// 


export type SharedModel =
    | SetupModel
    | GameModel

type SetupModel = {
    type: "Setup",
    player: UserId.UserId | "None"
    userPlayerType: PlayerType
    botLevel: BotLevel
}

type GameModel = {
    type: "Game",
    player: UserId.UserId,
    userPlayerType: PlayerType
    botLevel: BotLevel,
    board: Board
}

type BotLevel = "Easy" | "Medium" | "Impossible"

export const botLevels: { [botLevel in BotLevel]: BotLevel } = {
    Easy: "Easy",
    Medium: "Medium",
    Impossible: "Impossible"
}

export type FrontendModel = SharedModel

export type BackendModel = SharedModel

export const initSharedModel = ({ userId }: { userId: SetupModel['player'] }): SharedModel => {
    return {
        type: "Setup",
        botLevel: "Medium",
        userPlayerType: "X",
        player: userId
    }
}

export const isBotTurn = (model: SharedModel) => {
    return model.type === 'Game' && toTurn(model.board) !== model.userPlayerType
}

// 
// 
// 
// Msg
// 
// 
// 

export type FrontendMsg = Request

export type BackendMsg = ['Noop']

export type ToBackend = Request

export type ToFrontend = Response

export type Request =
    | InputBot
    | InputPlayerType
    | StartPlaying
    | StopPlaying
    | StartGame
    | StopGame
    | InputMove
    | SwapSides
    | Restart

export type Response =
    | InputBot_Done
    | InputPlayerType_Done
    | StartPlaying_Done
    | StopPlaying_Done
    | StartGame_Done
    | StopGame_Done
    | InputMove_Done
    | SwapSides_Done
    | Restart_Done

// 
// 
// 
// 
// 
// 

type InputPlayerType = ['InputPlayerType', { userId: UserId.UserId, playerType: PlayerType }]
type InputPlayerType_Done = ['InputPlayerType_Done', Result<InputPlayerTypeProblem, SharedModel>]
type InputPlayerTypeProblem = "not_playing" | "not_in_setup"

export const inputPlayerType = ({ userId, playerType }: InputPlayerType[1], model: SharedModel): InputPlayerType_Done[1] => {

    if (model.type !== 'Setup') {
        return Err("not_in_setup")
    }

    if (model.player !== userId) {
        return Err("not_playing")
    }

    const modelNew: SharedModel = {
        ...model,
        userPlayerType: playerType
    }

    return Ok(modelNew)
}

// 
// 
// 
// 
// 
// 

type InputBot = ['InputBot', { userId: UserId.UserId, botLevel: BotLevel }]
type InputBot_Done = ['InputBot_Done', Result<InputBotProblem, SharedModel>]
type InputBotProblem = "not_playing" | "not_in_setup"

export const inputBot = ({ userId, botLevel }: InputBot[1], model: SharedModel): InputBot_Done[1] => {

    if (model.type !== 'Setup') {
        return Err("not_in_setup")
    }

    if (model.player !== userId) {
        return Err("not_playing")
    }

    const modelNew: SharedModel = {
        ...model,
        botLevel: botLevel,
    }

    return Ok(modelNew)
}

// 
// 
// 
// 
// 
type StartPlaying = ['StartPlaying', { userId: UserId.UserId, }]
type StartPlaying_Done = ['StartPlaying_Done', Result<StartPlayingProblem, SharedModel>]
type StartPlayingProblem = "player_is_taken" | "not_in_setup"

export const startPlaying = ({ userId }: StartPlaying[1], model: SharedModel): StartPlaying_Done[1] => {
    if (model.type !== 'Setup') {
        return Err("not_in_setup")
    }

    if (model.player !== 'None') {
        return Err("player_is_taken")
    }

    return Ok({
        ...model,
        player: userId
    })
}

type StopPlaying = ['StopPlaying', { userId: UserId.UserId, }]
type StopPlaying_Done = ['StopPlaying_Done', Result<StopPlayingProblem, SharedModel>]
type StopPlayingProblem = "not_in_setup" | "not_playing"

export const stopPlaying = ({ userId }: StopPlaying[1], model: SharedModel): StopPlaying_Done[1] => {
    if (model.type !== 'Setup') {
        return Err("not_in_setup")
    }

    if (model.player !== userId) {
        return Err("not_playing")
    }

    return Ok({
        ...model,
        player: "None"
    })
}

// 
// 
// 
// 
// 

type StartGame = ['StartGame', { userId: UserId.UserId }]
type StartGame_Done = ['StartGame_Done', Result<StartGameProblem, SharedModel>]
type StartGameProblem = "not_in_setup" | "missing_player" | "not_playing"

export const startGame = ({ userId }: StartGame[1], model: SharedModel): StartGame_Done[1] => {
    if (model.type !== 'Setup') {
        return Err("not_in_setup")
    }

    if (model.player === 'None') {
        return Err("missing_player")
    }

    if (model.player !== userId) {
        return Err("not_playing")
    }

    const modelNew: SharedModel = {
        type: "Game",
        board: emptyBoard,
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType
    }

    return Ok(modelNew)
}

// 
// 
// 
// 

type StopGame = ['StopGame', { userId: UserId.UserId }]
type StopGame_Done = ['StopGame_Done', Result<StopGameProblem, SharedModel>]
type StopGameProblem = "not_started" | "not_playing"

export const stopGame = ({ userId }: StopGame[1], model: SharedModel): StopGame_Done[1] => {
    if (model.type !== "Game") {
        return Err("not_started")
    }

    if (model.player !== userId) {
        return Err("not_playing")
    }

    return Ok({
        type: "Setup",
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType
    })
}

// 
// 
// 
// 

type Restart = ['Restart', { userId: UserId.UserId }]
type Restart_Done = ['Restart_Done', Result<RestartProblem, SharedModel>]
type RestartProblem = "not_playing" | "not_in_game"

export const restart = ({ userId }: Restart[1], model: SharedModel): Restart_Done[1] => {
    if (model.type !== 'Game') {
        return Err("not_in_game")
    }

    if (model.player !== userId) {
        return Err("not_playing")
    }

    return Ok({
        ...model,
        board: emptyBoard
    })
}

// 
// 
// 
// 

type InputMove = ["InputMove", { userId: UserId.UserId, position: Position }]
type InputMove_Done = ["InputMove_Done", Result<InputMoveProblem, SharedModel>]
type InputMoveProblem = MoveProblem | "not_in_game" | "not_playing"

export const inputMove = ({ userId, position }: InputMove[1], model: SharedModel): InputMove_Done[1] => {
    if (model.type !== 'Game') {
        return Err("not_in_game")
    }

    if (model.player !== userId) {
        return Err("not_playing")
    }

    const result = move(model.board, model.userPlayerType, position)

    if (result.type === 'Err') {
        return result
    }

    return Ok({
        ...model,
        board: result.value
    })
}

// 
// 
// 
// 

type SwapSides = ["SwapSides", { userId: UserId.UserId, }]
type SwapSides_Done = ["SwapSides_Done", Result<SwapSidesProblem, SharedModel>]
type SwapSidesProblem = "not_in_game" | "not_playing"

export const swapSides = ({ userId, }: SwapSides[1], model: SharedModel): SwapSides_Done[1] => {
    if (model.type !== 'Game') {
        return Err("not_in_game")
    }

    if (model.player !== userId) {
        return Err("not_playing")
    }

    return Ok({
        ...model,
        userPlayerType: toOpposite(model.userPlayerType)
    })
}