import { exhaustive } from "../../../Core"
import { Err, Ok, Result } from "../../../Core/Result"
import { UserId } from "../../../Data/UserId"
import { ColumnIndex, Columns, emptyColumns, move, MoveProblem, opposite, PlayerType, toStatus, toTurn } from "../ConnectFour"

// 
// 
// Model
// 
// 

export type SharedModel = SetupModel | GameModel | GameOverModel

export type SetupModel = {
    type: "Setup",
    userPlayerType: PlayerType
    botLevel: BotLevel
    player: UserId | "None"
}

export type GameModel = {
    type: "Game",
    userPlayerType: PlayerType
    botLevel: BotLevel
    player: UserId
    columns: Columns
}

export type GameOverModel = {
    type: "GameOver"
    userPlayerType: PlayerType
    botLevel: BotLevel
    player: UserId
    columns: Columns
    gameOver: GameOver
}

export const isBotTurn = (model: SharedModel): boolean => {
    return model.type === 'Game' && toTurn(model.columns) === opposite[model.userPlayerType]
}

export type BackendModel = SharedModel

export type FrontendModel = SharedModel

export const initShared = ({ player }: { player: UserId | "None" }): SharedModel => {
    return {
        type: "Setup",
        botLevel: "Medium",
        player: player,
        userPlayerType: "PlayerOne"
    }
}

// 
// 
// 
// 

type GameOver = { type: "Tie" } | { type: "Winner", winner: PlayerType }

type BotLevel = "Easy" | "Medium" | "Hard"

// 
// 
// Msg
// 
// 

export type FrontendMsg = Req

export type BackendMsg = ["None"]

export type ToFrontend = Res | ['PlayerLeft', SharedModel]

export type ToBackend = Req

export type Req =
    | ['StartPlaying', { userId: UserId }]
    | ['StopPlaying', { userId: UserId }]
    | ['InputPlayerType', { userId: UserId, playerType: PlayerType }]
    | ['InputBotLevel', { userId: UserId, botLevel: BotLevel }]
    | ['StartGame', { userId: UserId }]
    | ['InputMove', { userId: UserId, columnIndex: ColumnIndex }]
    | ['StopGame', { userId: UserId }]
    | ['SwapSides', { userId: UserId }]
    | ['Restart', { userId: UserId }]

export type Res = [Req[0], Result<Problem, SharedModel>]

export type Problem =
    | "not_setup"
    | "not_game"
    | "player_taken"
    | "not_playing"
    | "missing_player"
    | MoveProblem

// 
// 
// 
// 

export const handle = (msg: Req, model: SharedModel): Result<Problem, SharedModel> => {
    switch (msg[0]) {
        case 'StartPlaying': {
            if (model.type !== 'Setup') {
                return Err("not_setup")
            }

            if (model.player !== 'None') {
                return Err("player_taken")
            }

            const modelNew: SharedModel = {
                ...model,
                player: msg[1].userId
            }

            return Ok(modelNew)
        }

        case 'StopPlaying': {
            if (model.type !== 'Setup') {
                return Err("not_setup")
            }

            if (model.player === 'None') {
                return Err("not_playing")
            }

            if (model.player !== msg[1].userId) {
                return Err("not_playing")
            }

            const modelNew: SharedModel = {
                ...model,
                player: "None"
            }

            return Ok(modelNew)
        }

        case 'InputPlayerType': {
            if (model.type !== 'Setup') {
                return Err("not_setup")
            }

            if (model.player !== msg[1].userId) {
                return Err("not_playing")
            }

            const modelNew: SharedModel = {
                ...model,
                userPlayerType: msg[1].playerType
            }

            return Ok(modelNew)
        }

        case 'InputBotLevel': {
            if (model.type !== 'Setup') {
                return Err("not_setup")
            }

            if (model.player !== msg[1].userId) {
                return Err("not_playing")
            }

            const modelNew: SharedModel = {
                ...model,
                botLevel: msg[1].botLevel
            }

            return Ok(modelNew)
        }

        case 'StartGame': {
            if (model.type !== 'Setup') {
                return Err('not_setup')
            }

            if (model.player !== msg[1].userId) {
                return Err("not_playing")
            }

            if (model.player === 'None') {
                return Err("missing_player")
            }

            const modelNew: SharedModel = {
                type: "Game",
                botLevel: model.botLevel,
                player: model.player,
                userPlayerType: model.userPlayerType,
                columns: emptyColumns
            }

            return Ok(modelNew)
        }

        case 'StopGame': {
            if (model.type !== 'Game') {
                return Err('not_game')
            }

            if (model.player !== msg[1].userId) {
                return Err('not_playing')
            }

            const modelNew: SharedModel = {
                type: "Setup",
                botLevel: model.botLevel,
                player: model.player,
                userPlayerType: model.userPlayerType
            }

            return Ok(modelNew)
        }

        case 'SwapSides': {
            if (model.type !== 'Game') {
                return Err('not_game')
            }

            if (model.player !== msg[1].userId) {
                return Err('not_playing')
            }

            const modelNew: SharedModel = {
                ...model,
                columns: emptyColumns,
                userPlayerType: opposite[model.userPlayerType]
            }

            return Ok(modelNew)
        }

        case 'InputMove': {
            if (model.type !== 'Game') {
                return Err("not_game")
            }

            if (model.player !== msg[1].userId) {
                return Err("not_playing")
            }

            const result = move(model.columns, msg[1].columnIndex, model.userPlayerType)

            if (result.type === 'Err') {
                return result
            }

            const columnsNew = result.value

            const statusNew = toStatus(columnsNew)

            if (statusNew.type === 'Playing') {
                const modelNew: SharedModel = {
                    ...model,
                    columns: columnsNew
                }

                return Ok(modelNew)
            }

            const gameOver: GameOver =
                statusNew.type === 'Tie'
                    ? { type: "Tie" }
                    : { type: "Winner", winner: statusNew.winner }

            const modelNew: SharedModel = {
                type: "GameOver",
                botLevel: model.botLevel,
                columns: model.columns,
                gameOver: gameOver,
                player: model.player,
                userPlayerType: model.userPlayerType
            }

            return Ok(modelNew)
        }

        case 'Restart': {
            if (model.type !== 'Game') {
                return Err("not_game")
            }

            if (model.player !== msg[1].userId) {
                return Err("not_playing")
            }

            const modelNew: GameModel = {
                ...model,
                columns: emptyColumns
            }

            return Ok(modelNew)
        }

        default: {
            return exhaustive(msg[0])
        }
    }
}