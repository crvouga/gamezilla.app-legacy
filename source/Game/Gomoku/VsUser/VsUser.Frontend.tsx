import { Cmd, Sub } from "../../../Core";
import { actionButton, box, button, conformation, fillBox, text } from "../../../UI";
import { Ctx, viewUserPlayerSlotBar, viewVsUserSetupScreen } from "../../Game";
import { viewBoard, viewCoverArt, viewStoneIcon } from "../Gomoku/Gomoku";
import { BackendModel, FrontendModel, FrontendMsg, initShared, ModelGameOver, ToBackend, ToFrontend } from "./VsUser.Types";

//
//
//
// model
//
//
//

export type Model = FrontendModel;

export const init = initShared

//
//
//
// update
//
//
//

export type Msg = FrontendMsg

export const update = ({ msg, model, sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd, msg: Msg, model: Model }): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'ClickedCancel': {
            return [{ ...model, confirming: undefined }, Cmd.None]
        }

        case 'Resign': {
            if (model.confirming === 'Resign') {
                return [model, sendToBackend(msg)]
            }
            return [{ ...model, confirming: 'Resign' }, Cmd.None]
        }
        default: {
            return [model, sendToBackend(msg)]
        }
    }
};


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {

        case 'input-move': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }
            const merged = mergeWithBackend({ backendModel: msg[1].value, frontendModel: model })

            return [merged, Cmd.None,]
        }

        default: {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }
            const merged = mergeWithBackend({ backendModel: msg[1].value, frontendModel: model })
            return [merged, Cmd.None]
        }
    }
};

export const mergeWithBackend = ({ backendModel }: { frontendModel: FrontendModel, backendModel: BackendModel }): FrontendModel => {
    return backendModel
}

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
    return Sub.None;
};

// 
// 
// 
// view
// 
// 
// 

export const view = ({ model, ctx, onCancel, $send }: { $send: (m: Msg) => void; ctx: Ctx; model: Model, onCancel: () => void }) => {
    switch (model.type) {
        case 'setup': {
            return (
                viewVsUserSetupScreen({
                    title: "Gomoku",
                    subtitle: "Player Vs Player",
                    coverArt: viewCoverArt(),
                    ctx,
                    playerOne: {
                        label: 'White',
                        userId: model.white,
                        onStartPlaying: () => $send(["start-playing", { stone: 'white' }]),
                        onStopPlaying: () => $send(["stop-playing", { stone: 'white' }]),
                        icon: (sx) => viewStoneIcon({ ...sx, stone: 'white' })
                    },
                    playerTwo: {
                        label: 'Black',
                        userId: model.black,
                        onStartPlaying: () => $send(["start-playing", { stone: 'black' }]),
                        onStopPlaying: () => $send(["stop-playing", { stone: 'black' }]),
                        icon: sx => viewStoneIcon({ ...sx, stone: 'black' })
                    },
                    onCancel,
                    onStartGame: () => $send(['start-game']),
                })
            )
        }

        case 'playing': {
            return (
                fillBox({}, [
                    viewUserPlayerSlotBar({ left: model.white, right: model.black, ctx }),
                    viewBoard({
                        board: model.board,
                        onPress: position => $send(['input-move', { position }])
                    }),
                    box({ flex: 1 }, []),
                    box({ display: 'flex', p: 2, }, [
                        actionButton({ label: 'Resign', iconName: 'flag', onPress: () => $send(['Resign']) }),
                    ]),
                    conformation({
                        open: 'Resign' === model.confirming,
                        title: 'Resign from game?',
                        iconName: 'flag',
                        confirmTitle: 'Resign',
                        onConfirm: () => $send(['Resign',]),
                        onCancel: () => $send(['ClickedCancel',]),
                        onClose: () => $send(['ClickedCancel',]),
                    }),

                ])
            )

        }

        case 'gameOver': {
            return (
                fillBox({}, [
                    viewUserPlayerSlotBar({ left: model.white, right: model.black, ctx }),
                    box({ position: "relative", aspectRatio: "1", }, [
                        viewBoard({ board: model.board, }),
                        viewOverlay({ model, ctx }),
                    ]),
                    box({ p: 2, display: 'flex', gap: 2, flexDirection: 'column' }, [
                        button({ onPress: () => $send(['RematchRequest']), variant: "contained", startIcon: 'restart', width: '100%', }, 'Rematch'),
                        button({ onPress: () => $send(['stop-game']), variant: "contained", startIcon: 'exit', width: '100%', }, 'Back to lobby'),
                    ]),
                ])
            )
        }

    }

}



export const viewOverlay = ({ model, ctx }: { model: ModelGameOver, ctx: Ctx }) => {
    return (
        box({
            position: 'absolute', top: 0, left: 0, width: '100%',
            display: 'flex', flexDirection: "column", justifyContent: 'center', alignItems: 'center',
            color: "#fff", backgroundColor: 'rgba(0,0,0,0.66)',
            aspectRatio: "1",
        }, [
            viewOverlay_({ model, ctx })
        ])
    )
}

export const viewOverlay_ = ({ model, ctx }: { model: ModelGameOver, ctx: Ctx }) => {

    const currentUserStone = ctx.currentUserId === model.white ? 'white' : 'black'
    if (model.gameOver.type === 'Resigned' && model.gameOver.resigner === currentUserStone) {
        return (
            text({ color: 'white', variant: 'h2', }, [
                'You resigned'
            ])
        )
    }

    if (model.gameOver.type === 'Resigned') {
        return (
            box({ display: 'flex', alignItems: 'center', }, [
                viewStoneIcon({ stone: model.gameOver.resigner, width: 64, height: 64, mr: 2 }),
                text({ color: 'white', variant: 'h1', }, "Resigned")
            ])
        )
    }

    if (model.gameOver.type === 'Draw') {
        return (
            text({ color: 'white', variant: 'h1', }, [
                'Draw'
            ])
        )
    }

    if (model.gameOver.type === 'Winner' && model.gameOver.winner === currentUserStone) {
        return (
            text({ color: 'white', variant: 'h1', }, [
                'You won'
            ])
        )
    }

    if (model.gameOver.type === 'Winner') {
        return (
            box({ display: 'flex', alignItems: 'center', }, [
                viewStoneIcon({ stone: model.gameOver.winner, width: 64, height: 64, mr: 2 }),
                text({ color: 'white', variant: 'h1', }, "Won")
            ])
        )
    }

    return (
        text({ color: 'white', variant: 'h2', }, [
            'Game Over'
        ])
    )
}