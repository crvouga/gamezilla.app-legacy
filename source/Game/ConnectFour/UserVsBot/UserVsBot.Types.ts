import { exhaustive } from "../../../Core"
import { Err, Ok, Result } from "../../../Core/Result"
import { UserId } from "../../../Data/UserId"
import { ColumnIndex, Columns, emptyColumns, move, MoveProblem, opposite, PlayerType, toStatus } from "../ConnectFour"

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


export type BackendModel = SharedModel

export type FrontendModel = SharedModel

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

export type ToFrontend = Res

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

export type Res =
    | ['StartPlaying_Done', Result<"not_setup" | "player_taken", SharedModel>]
    | ['StopPlaying_Done', Result<"not_setup" | "not_playing", SharedModel>]
    | ['InputPlayerType_Done', Result<"not_setup" | "not_playing", SharedModel>]
    | ['InputBotLevel_Done', Result<"not_setup" | "not_playing", SharedModel>]
    | ['StartGame_Done', Result<"not_setup" | "not_playing" | "missing_player", SharedModel>]
    | ['InputMove_Done', Result<MoveProblem | "not_playing" | "not_game", SharedModel>]
    | ['StopGame_Done', Result<"not_game" | "not_playing", SharedModel>]
    | ['SwapSides_Done', Result<"not_game" | "not_playing", SharedModel>]
    | ['Restart_Done', Result<"not_game" | "not_playing", SharedModel>]

// 
// 
// 
// 

export const handle = (msg: Req, model: SharedModel): Res => {
    switch (msg[0]) {
        case 'StartPlaying': {
            if (model.type !== 'Setup') {
                return ['StartPlaying_Done', Err("not_setup")]
            }

            if (model.player !== 'None') {
                return ['StartPlaying_Done', Err("player_taken")]
            }

            const modelNew: SharedModel = {
                ...model,
                player: msg[1].userId
            }

            return ['StartPlaying_Done', Ok(modelNew)]
        }

        case 'StopPlaying': {
            if (model.type !== 'Setup') {
                return ['StopPlaying_Done', Err("not_setup")]
            }

            if (model.player === 'None') {
                return ['StopPlaying_Done', Err("not_playing")]
            }

            if (model.player !== msg[1].userId) {
                return ['StopPlaying_Done', Err("not_playing")]
            }

            const modelNew: SharedModel = {
                ...model,
                player: "None"
            }

            return ['StopPlaying_Done', Ok(modelNew)]
        }

        case 'InputPlayerType': {
            if (model.type !== 'Setup') {
                return ['InputPlayerType_Done', Err("not_setup")]
            }

            if (model.player !== msg[1].userId) {
                return ['InputPlayerType_Done', Err("not_playing")]
            }

            const modelNew: SharedModel = {
                ...model,
                userPlayerType: msg[1].playerType
            }

            return ['InputPlayerType_Done', Ok(modelNew)]
        }

        case 'InputBotLevel': {
            if (model.type !== 'Setup') {
                return ['InputBotLevel_Done', Err("not_setup")]
            }

            if (model.player !== msg[1].userId) {
                return ['InputBotLevel_Done', Err("not_playing")]
            }

            const modelNew: SharedModel = {
                ...model,
                botLevel: msg[1].botLevel
            }

            return ['InputBotLevel_Done', Ok(modelNew)]
        }

        case 'StartGame': {
            if (model.type !== 'Setup') {
                return ['StartGame_Done', Err('not_setup')]
            }

            if (model.player !== msg[1].userId) {
                return ['StartGame_Done', Err("not_playing")]
            }

            if (model.player === 'None') {
                return ['StartGame_Done', Err("missing_player")]
            }

            const modelNew: SharedModel = {
                type: "Game",
                botLevel: model.botLevel,
                player: model.player,
                userPlayerType: model.userPlayerType,
                columns: emptyColumns
            }

            return ['StartGame_Done', Ok(modelNew)]
        }

        case 'StopGame': {
            if (model.type !== 'Game') {
                return ['StopGame_Done', Err('not_game')]
            }

            if (model.player !== msg[1].userId) {
                return ['StopGame_Done', Err('not_playing')]
            }

            const modelNew: SharedModel = {
                type: "Setup",
                botLevel: model.botLevel,
                player: model.player,
                userPlayerType: model.userPlayerType
            }

            return ['StopGame_Done', Ok(modelNew)]
        }

        case 'SwapSides': {
            if (model.type !== 'Game') {
                return ['SwapSides_Done', Err('not_game')]
            }

            if (model.player !== msg[1].userId) {
                return ['StartGame_Done', Err('not_playing')]
            }

            const modelNew: SharedModel = {
                ...model,
                columns: emptyColumns,
                userPlayerType: opposite[model.userPlayerType]
            }

            return ['SwapSides_Done', Ok(modelNew)]
        }

        case 'InputMove': {
            if (model.type !== 'Game') {
                return ['InputMove_Done', Err("not_game")]
            }

            if (model.player !== msg[1].userId) {
                return ['InputMove_Done', Err("not_playing")]
            }

            const result = move(model.columns, msg[1].columnIndex, model.userPlayerType)

            if (result.type === 'Err') {
                return ['InputMove_Done', result]
            }

            const columnsNew = result.value

            const statusNew = toStatus(columnsNew)

            if (statusNew.type === 'Playing') {
                const modelNew: SharedModel = {
                    ...model,
                    columns: columnsNew
                }

                return ['InputMove_Done', Ok(modelNew)]
            }

            const modelNew: SharedModel = {
                type: "GameOver",
                botLevel: model.botLevel,
                columns: model.columns,
                gameOver: statusNew.type === 'Tie' ? { type: "Tie" } : { type: "Winner", winner: statusNew.winner },
                player: model.player,
                userPlayerType: model.userPlayerType
            }

            return ['InputMove_Done', Ok(modelNew)]
        }

        case 'Restart': {
            if (model.type !== 'Game') {
                return ['Restart_Done', Err("not_game")]
            }

            if (model.player !== msg[1].userId) {
                return ['Restart_Done', Err("not_playing")]
            }

            const modelNew: GameModel = {
                ...model,
                columns: emptyColumns
            }

            return ['Restart_Done', Ok(modelNew)]
        }

        default: {
            return exhaustive(msg[0])
        }
    }
}