import { Cmd, pipe, Sub } from "../../../Core";
import { getBestMove, move } from "../TicTacToe";
import { BackendModel, BackendMsg, botMove, initSharedModel, inputBot, inputMove, inputPlayerType, isBotTurn, Response, restart, startGame, startPlaying, stopGame, stopPlaying, swapSides, ToBackend, ToFrontend } from "./UserVsBot.Types";

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init = initSharedModel

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = ({ sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'BotMove': {
            const response: ToFrontend = ['BotMove_Done', botMove(msg[1], model)]
            const modelNext = response[1].type === 'Ok' ? response[1].value : model
            return [modelNext, sendToRoom(response)]
        }
    }
};

type UpdateFromFrontend = (wire: { sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>, sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> }, msg: ToBackend, model: Model) => [Model, Cmd.Cmd<Msg>]

export const updateFromFrontend: UpdateFromFrontend = (wire, msg, modelPrev) => {
    const [modelNext, cmd] = updateFromFrontend_(wire, msg, modelPrev)

    if (!isBotTurn(modelPrev) && isBotTurn(modelNext)) {
        return [
            modelNext,
            Cmd.batch([
                cmd,
                pipe(getBestMove(modelNext.board), Cmd.perform((position): Msg => ['BotMove', { position }]))

            ])
        ]
    }

    return [modelNext, cmd]
}

export const updateFromFrontend_: UpdateFromFrontend = ({ sendToClient, sendToRoom }, msg, model) => {
    switch (msg[0]) {
        case 'StartGame': {
            const response: Response = ['StartGame_Done', startGame(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }
        case 'StopPlaying': {
            const response: Response = ['StopPlaying_Done', stopPlaying(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }

        case 'StartPlaying': {
            const response: Response = ['StartPlaying_Done', startPlaying(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }

        case 'InputBot': {
            const response: Response = ['InputBot_Done', inputBot(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }

        case 'InputPlayerType': {
            const response: Response = ['InputPlayerType_Done', inputPlayerType(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }

        case 'StopGame': {
            const response: Response = ['StopGame_Done', stopGame(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }

        case 'InputMove': {
            const response: Response = ['InputMove_Done', inputMove(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }

        case 'SwapSides': {
            const response: Response = ['SwapSides_Done', swapSides(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }

        case 'Restart': {
            const response: Response = ['Restart_Done', restart(msg[1], model)]
            if (response[1].type === 'Err') {
                return [model, sendToClient(response)]
            }
            return [response[1].value, sendToRoom(response)]
        }
    }

}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
    return Sub.None;
};
