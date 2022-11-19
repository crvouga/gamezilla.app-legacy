import { Cmd, Sub } from "../../../Core";
import { UserId } from "../../../Data/UserId";
import * as Snackbar from "../../../Snackbar";
import * as UI from "../../../UI";
import { Ctx, VersusHeader } from "../../Game.Shared";
import { gameTheme, PlayerType, ViewColumns } from "../ConnectFour";
import { PlayerIcon } from "../Views";
import { BackendModel, botLevel, FrontendModel, FrontendMsg, GameModel, GameOver, handle, initShared, isBotTurn, SetupModel, ToBackend, ToFrontend, toGameOver } from "./UserVsBot.Types";

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

type OutAction = Snackbar.Action

export const update = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd }, msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'InputMove':
        case 'InputPlayerType':
        case 'Restart':
        case 'StartGame':
        case 'StartPlaying':
        case 'StopGame':
        case 'StopPlaying':
        case 'SwapSides':
        case 'InputBotLevel': {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>, OutAction[]] => {
    switch (msg[0]) {

        case 'PlayerLeft': {
            const modelNew = mergeWithBackend({ frontendModel: model, backendModel: msg[1] })
            return [modelNew, Cmd.None, []]
        }

        case 'BotMove': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None, []]
            }

            const modelNew = mergeWithBackend({ frontendModel: model, backendModel: msg[1].value })

            return [modelNew, Cmd.None, []]
        }

        case 'InputMove':
        case 'InputPlayerType':
        case 'Restart':
        case 'StartGame':
        case 'StartPlaying':
        case 'StopGame':
        case 'StopPlaying':
        case 'SwapSides':
        case 'InputBotLevel': {

            if (msg[1].type === 'Err') {
                return [model, Cmd.None, []]
            }

            const modelNew = mergeWithBackend({ frontendModel: model, backendModel: msg[1].value })

            return [modelNew, Cmd.None, []]
        }
    }
};

export const mergeWithBackend = ({ backendModel }: { frontendModel: FrontendModel, backendModel: BackendModel }): FrontendModel => {
    return backendModel
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
    return Sub.None;
};

// 
// 
// 
// View
// 
// 
// 

export const View = (
    {
        model,
        goBack,
        ctx,
        $d
    }: {
        model: Model;
        $d: (msg: Msg) => void;
        goBack: () => void;
        ctx: Ctx
    }) => {

    if (model.type === 'Setup') {
        return (
            <ViewSetup
                model={model}
                goBack={goBack}
                ctx={ctx}
                $d={$d}
            />
        )
    }

    const stopGameRes = handle(['StopGame', { userId: ctx.currentUserId }], model)
    const restartRes = handle(['Restart', { userId: ctx.currentUserId }], model)
    const swapSidesRes = handle(['SwapSides', { userId: ctx.currentUserId }], model)
    const gameOver = toGameOver(model)
    return (
        <UI.FillBox>
            <UI.Box sx={{ display: 'flex', alignItems: 'center', padding: 1, gap: 1, paddingBottom: 2 }}>
                <ViewGamePlayerSlot model={model} ctx={ctx} playerType="PlayerOne" />
                <ViewGamePlayerSlot model={model} ctx={ctx} playerType="PlayerTwo" />
            </UI.Box>

            <UI.Box sx={{ position: "relative" }}>
                <ViewColumns
                    columns={model.columns}
                    onClick={columnIndex => $d(['InputMove', { columnIndex, userId: ctx.currentUserId }])}
                />
                <UI.Fade in={gameOver.type !== 'None'}>
                    <UI.Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: "center", background: "rgba(0, 0, 0, 0.333)", color: "#fff" }}>
                        {gameOver.type !== 'None' && (
                            <ViewGameOverMessage model={model} currentUserId={ctx.currentUserId} gameOver={gameOver} />
                        )}
                    </UI.Box>
                </UI.Fade>
            </UI.Box>

            <UI.Box sx={{ flex: 1 }} />
            <UI.Box sx={{ display: 'flex' }}>
                <UI.ActionButton
                    icon={<UI.Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />}
                    label="Exit"
                    onClick={() => $d(['StopGame', { userId: ctx.currentUserId, }])}
                    disabled={stopGameRes.type === 'Err'}
                />
                <UI.ActionButton
                    icon={<UI.Icons.RestartAlt />}
                    label="Restart"
                    onClick={() => $d(['Restart', { userId: ctx.currentUserId, }])}
                    disabled={restartRes.type === 'Err'}
                />
                <UI.ActionButton
                    icon={<UI.Icons.SwapHorizSharp />}
                    label="Swap"
                    onClick={() => $d(['SwapSides', { userId: ctx.currentUserId, }])}
                    disabled={swapSidesRes.type === 'Err'}
                />
            </UI.Box>
        </UI.FillBox>
    )
}

const ViewGameOverMessage = ({ gameOver, currentUserId, model }: { model: Model, currentUserId: UserId, gameOver: GameOver }) => {
    switch (gameOver.type) {
        case 'Tie': {
            return <>
                <UI.Typography align="center" fontSize={64}>
                    Tie
                </UI.Typography>
            </>
        }

        case 'Winner': {
            const winner = gameOver.winner

            if (model.player === currentUserId) {
                if (winner === model.userPlayerType) {
                    return <>
                        <UI.Typography align="center" fontSize={64}>
                            You Won
                        </UI.Typography>
                    </>
                }

                return <>
                    <UI.Typography align="center" fontSize={64}>
                        You Lost
                    </UI.Typography>
                </>
            }

            const size = 72
            return <>
                <UI.Box sx={{ width: "100%", display: 'flex', alignItems: "center", justifyContent: "center", gap: 2 }}>
                    <PlayerIcon sx={{ width: size, height: size }} playerType={winner} />
                    <UI.Typography align="center" fontSize={size}>
                        Won
                    </UI.Typography>
                </UI.Box>
            </>

        }
    }

}

const ViewGamePlayerSlot = ({ model, playerType, ctx }: { model: GameModel, playerType: PlayerType, ctx: Ctx }) => {
    const size = { width: 32, height: 32, }

    if (model.userPlayerType === playerType) {
        return (
            <UI.Box sx={{ display: 'flex', alignItems: 'center', flex: 1, overflow: "hidden" }}>
                <PlayerIcon playerType={playerType} sx={{ ...size, marginRight: 1 }} />
                <UI.Avatar src={ctx.profiles[model.player]?.avatarUrl} sx={{ ...size, marginRight: 1 }} />
                <UI.Typography noWrap>
                    {ctx.profiles[model.player]?.username ?? "..."}
                </UI.Typography>
            </UI.Box>
        )
    }

    return (
        <UI.Box sx={{ display: 'flex', alignItems: 'center', flex: 1, overflow: "hidden" }}>
            <PlayerIcon playerType={playerType} sx={{ ...size, marginRight: 1 }} />
            <UI.Icons.SmartToy sx={{ ...size, padding: 0, margin: 0, marginRight: 1 }} />
            <UI.Typography noWrap sx={{ flex: 1 }}>
                {model.botLevel}
            </UI.Typography>
            {isBotTurn(model) && (
                <UI.Box sx={{ marginLeft: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UI.CircularProgress
                        size={size.width * 3 / 4}
                    />
                </UI.Box>
            )}
        </UI.Box>
    )

}


const ViewSetup = (
    {
        model,
        goBack,
        ctx,
        $d
    }: {
        model: SetupModel;
        $d: (msg: Msg) => void;
        ctx: Ctx,
        goBack: () => void;

    }) => {
    const startGameRes = handle(['StartGame', { userId: ctx.currentUserId }], model)
    return (
        <UI.FillBox>
            <UI.Box sx={{ flex: 1, overflowY: "scroll" }}>
                <VersusHeader
                    ctx={ctx}
                    background={
                        <UI.Box sx={{ width: '100%', height: '100%', background: `linear-gradient(${gameTheme.primary.light}, ${gameTheme.primary.darker})` }} />
                    }
                    renderLeftIcon={sx => <PlayerIcon playerType="PlayerOne" sx={{ ...sx }} />}
                    left={
                        model.userPlayerType === 'PlayerOne'
                            ? model.player === 'None'
                                ? { type: "None" }
                                : { type: "User", userId: model.player }
                            : { type: "Bot", label: model.botLevel }
                    }
                    renderRightIcon={sx => <PlayerIcon playerType="PlayerTwo" sx={{ ...sx }} />}
                    right={
                        model.userPlayerType === 'PlayerTwo'
                            ? model.player === 'None'
                                ? { type: "None" }
                                : { type: "User", userId: model.player }
                            : { type: "Bot", label: model.botLevel }
                    }
                />

                <UI.Typography sx={{ paddingX: 2, paddingTop: 2, paddingBottom: 1 }} color="text.secondary">
                    Player
                </UI.Typography>

                {model.player === 'None' ? (
                    <UI.Box sx={{ paddingX: 2 }}>
                        <UI.Button variant="contained" fullWidth onClick={() => $d(['StartPlaying', { userId: ctx.currentUserId }])}>
                            Start Playing
                        </UI.Button>
                    </UI.Box>
                ) : (
                    <UI.Box sx={{ display: 'flex', alignItems: "center", justifyContent: 'center', paddingX: 2, width: '100%', }}>
                        <UI.Avatar src={ctx.profiles[model.player]?.avatarUrl} sx={{ marginRight: 2 }} />
                        <UI.Typography noWrap sx={{ flex: 1 }}>
                            {ctx.profiles[model.player]?.username ?? "..."}
                        </UI.Typography>
                        {model.player === ctx.currentUserId && (
                            <UI.Button onClick={() => $d(['StopPlaying', { userId: ctx.currentUserId }])}>
                                Stop Playing
                            </UI.Button>
                        )}
                    </UI.Box>
                )}

                <UI.Divider sx={{ marginY: 2 }} />

                <UI.Typography sx={{ paddingX: 2, paddingBottom: 1 }} color="text.secondary">
                    Play As
                </UI.Typography>

                <UI.Box sx={{ paddingX: 2, paddingBottom: 2 }} >
                    <UI.ToggleButtonGroup value={model.userPlayerType} fullWidth>
                        <UI.ToggleButton value={"PlayerOne"} onClick={() => $d(['InputPlayerType', { userId: ctx.currentUserId, playerType: "PlayerOne" }])}>
                            <PlayerIcon playerType="PlayerOne" sx={{ width: 32, height: 32 }} />
                        </UI.ToggleButton>
                        <UI.ToggleButton value={"PlayerTwo"} onClick={() => $d(['InputPlayerType', { userId: ctx.currentUserId, playerType: "PlayerTwo" }])}>
                            <PlayerIcon playerType="PlayerTwo" sx={{ width: 32, height: 32 }} />
                        </UI.ToggleButton>
                    </UI.ToggleButtonGroup>
                </UI.Box>

                <UI.Typography sx={{ paddingX: 2, paddingBottom: 1 }} color="text.secondary">
                    Bot Level
                </UI.Typography>

                <UI.Box sx={{ paddingX: 2, paddingBottom: 4 }} >
                    <UI.ToggleButtonGroup value={model.botLevel} fullWidth>
                        {Object.values(botLevel).map(botLevel => (
                            <UI.ToggleButton key={botLevel} value={botLevel} onClick={() => $d(['InputBotLevel', { userId: ctx.currentUserId, botLevel }])}>
                                {botLevel}
                            </UI.ToggleButton>
                        ))}
                    </UI.ToggleButtonGroup>
                </UI.Box>

            </UI.Box>

            <UI.Box sx={{ padding: 2, gap: 2, display: "flex", }}>
                <UI.Button variant="outlined" onClick={goBack} fullWidth>
                    Back
                </UI.Button>

                <UI.Button variant="contained" onClick={() => $d(['StartGame', { userId: ctx.currentUserId }])} fullWidth disabled={startGameRes.type === 'Err'}>
                    Start Game
                </UI.Button>
            </UI.Box>
        </UI.FillBox>
    )
}
