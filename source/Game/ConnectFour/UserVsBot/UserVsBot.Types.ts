import { Err, Ok, Result } from "../../../Core/Result"
import { UserId } from "../../../Data/UserId"
import { PlayerType } from "../ConnectFour"

// 
// 
// Model
// 
// 

export type SharedModel = SetupModel

type SetupModel = {
    type: "Setup",
    userPlayerType: PlayerType
    botLevel: BotLevel
    player: UserId | "None"
}

type BotLevel = "Easy" | "Medium" | "Hard"

export type BackendModel = SharedModel

export type FrontendModel = SharedModel

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

export type Res =
    | ['StartPlaying_Done', Result<"not_setup" | "player_taken", SharedModel>]
    | ['StopPlaying_Done', Result<"not_setup" | "not_playing", SharedModel>]
    | ['InputPlayerType_Done', Result<"not_setup" | "not_playing", SharedModel>]
    | ['InputBotLevel_Done', Result<"not_setup" | "not_playing", SharedModel>]

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
    }
}