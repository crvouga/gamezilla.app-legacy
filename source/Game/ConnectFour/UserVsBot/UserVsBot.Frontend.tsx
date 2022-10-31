import { Cmd, Sub } from "../../../Core";
import { UserId } from "../../../Data/UserId";
import * as Snackbar from "../../../Snackbar";
import * as Store from "../../../Store";
import * as UI from "../../../UI";
import { VersusHeader } from "../../Views";
import { gameTheme, PlayerType, ViewColumns } from "../ConnectFour";
import { PlayerIcon } from "../Views";
import { BackendModel, botLevel, GameOver, FrontendModel, FrontendMsg, GameModel, handle, initShared, isBotTurn, SetupModel, ToBackend, ToFrontend, toGameOver } from "./UserVsBot.Types";

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

export const update = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
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

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
    switch (msg[0]) {

        case 'PlayerLeft': {
            const modelNew = mergeWithBackend({ frontendModel: model, backendModel: msg[1] })
            return [modelNew, Cmd.None, [['Snackbar', { message: "Player left the game", variant: "Info" }]]]
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

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
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
        store,
        roomComponent,
        goHome,
        currentUserId,
        dispatch
    }: {
        model: Model;
        dispatch: (msg: Msg) => void;
        currentUserId: UserId;
        goBack: () => void;
        store: Store.Model;
        goHome: () => void;
        roomComponent: UI.ViewNode;
    }) => {

    if (model.type === 'Setup') {
        return (
            <ViewSetup
                model={model}
                goBack={goBack}
                store={store}
                roomComponent={roomComponent}
                goHome={goHome}
                currentUserId={currentUserId}
                dispatch={dispatch}
            />
        )
    }

    const stopGameRes = handle(['StopGame', { userId: currentUserId }], model)
    const restartRes = handle(['Restart', { userId: currentUserId }], model)
    const swapSidesRes = handle(['SwapSides', { userId: currentUserId }], model)
    const gameOver = toGameOver(model)
    return (
        <UI.FillBox>
            <UI.Header
                left={
                    <UI.IconButton sx={{ marginLeft: -1 }} onClick={goHome}>
                        <UI.Icons.Home />
                    </UI.IconButton>
                }
                title="Connect Four"
                right={roomComponent}
            />


            <UI.Box sx={{ display: 'flex', alignItems: 'center', padding: 1, gap: 1, paddingBottom: 2 }}>
                <ViewGamePlayerSlot model={model} store={store} playerType="PlayerOne" />
                <ViewGamePlayerSlot model={model} store={store} playerType="PlayerTwo" />
            </UI.Box>

            <UI.Box sx={{ position: "relative" }}>
                <ViewColumns
                    columns={model.columns}
                    onClick={columnIndex => dispatch(['InputMove', { columnIndex, userId: currentUserId }])}
                />
                <UI.Fade in={gameOver.type !== 'None'}>
                    <UI.Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: "center", background: "rgba(0, 0, 0, 0.333)", color: "#fff" }}>
                        {gameOver.type !== 'None' && (
                            <ViewGameOverMessage model={model} currentUserId={currentUserId} gameOver={gameOver} />
                        )}
                    </UI.Box>
                </UI.Fade>
            </UI.Box>

            <UI.Box sx={{ flex: 1 }} />
            <UI.Box sx={{ display: 'flex' }}>
                <UI.ActionButton
                    icon={<UI.Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />}
                    label="Exit"
                    onClick={() => dispatch(['StopGame', { userId: currentUserId, }])}
                    disabled={stopGameRes.type === 'Err'}
                />
                <UI.ActionButton
                    icon={<UI.Icons.RestartAlt />}
                    label="Restart"
                    onClick={() => dispatch(['Restart', { userId: currentUserId, }])}
                    disabled={restartRes.type === 'Err'}
                />
                <UI.ActionButton
                    icon={<UI.Icons.SwapHorizSharp />}
                    label="Swap"
                    onClick={() => dispatch(['SwapSides', { userId: currentUserId, }])}
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

const ViewGamePlayerSlot = ({ model, playerType, store }: { model: GameModel, playerType: PlayerType, store: Store.Model }) => {
    const size = { width: 32, height: 32, }

    if (model.userPlayerType === playerType) {
        return (
            <UI.Box sx={{ display: 'flex', alignItems: 'center', flex: 1, overflow: "hidden" }}>
                <PlayerIcon playerType={playerType} sx={{ ...size, marginRight: 1 }} />
                <UI.Avatar src={store.Profile[model.player]?.avatarUrl} sx={{ ...size, marginRight: 1 }} />
                <UI.Typography noWrap>
                    {store.Profile[model.player]?.username ?? "..."}
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
                <UI.Box sx={{ marginLeft: 1 }}>
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
        store,
        roomComponent,
        goHome,
        currentUserId,
        dispatch
    }: {
        model: SetupModel;
        dispatch: (msg: Msg) => void;
        currentUserId: UserId;
        goBack: () => void;
        store: Store.Model;
        goHome: () => void;
        roomComponent: UI.ViewNode;
    }) => {
    const startGameRes = handle(['StartGame', { userId: currentUserId }], model)
    return (
        <UI.FillBox>
            <UI.Header
                left={
                    <UI.IconButton sx={{ marginLeft: -1 }} onClick={goHome}>
                        <UI.Icons.Home />
                    </UI.IconButton>
                }
                title="Connect Four"
                right={roomComponent}
            />
            <VersusHeader
                store={store}
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
                    <UI.Button variant="contained" fullWidth onClick={() => dispatch(['StartPlaying', { userId: currentUserId }])}>
                        Start Playing
                    </UI.Button>
                </UI.Box>
            ) : (
                <UI.Box sx={{ display: 'flex', alignItems: "center", justifyContent: 'center', paddingX: 2, width: '100%', }}>
                    <UI.Avatar src={store.Profile[model.player]?.avatarUrl} sx={{ marginRight: 2 }} />
                    <UI.Typography noWrap sx={{ flex: 1 }}>
                        {store.Profile[model.player]?.username ?? "..."}
                    </UI.Typography>
                    {model.player === currentUserId && (
                        <UI.Button onClick={() => dispatch(['StopPlaying', { userId: currentUserId }])}>
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
                    <UI.ToggleButton value={"PlayerOne"} onClick={() => dispatch(['InputPlayerType', { userId: currentUserId, playerType: "PlayerOne" }])}>
                        <PlayerIcon playerType="PlayerOne" sx={{ width: 32, height: 32 }} />
                    </UI.ToggleButton>
                    <UI.ToggleButton value={"PlayerTwo"} onClick={() => dispatch(['InputPlayerType', { userId: currentUserId, playerType: "PlayerTwo" }])}>
                        <PlayerIcon playerType="PlayerTwo" sx={{ width: 32, height: 32 }} />
                    </UI.ToggleButton>
                </UI.ToggleButtonGroup>
            </UI.Box>

            <UI.Typography sx={{ paddingX: 2, paddingBottom: 1 }} color="text.secondary">
                Bot Level
            </UI.Typography>

            <UI.Box sx={{ paddingX: 2, }} >
                <UI.ToggleButtonGroup value={model.botLevel} fullWidth>
                    {Object.values(botLevel).map(botLevel => (
                        <UI.ToggleButton key={botLevel} value={botLevel} onClick={() => dispatch(['InputBotLevel', { userId: currentUserId, botLevel }])}>
                            {botLevel}
                        </UI.ToggleButton>
                    ))}
                </UI.ToggleButtonGroup>
            </UI.Box>

            <UI.Box sx={{ flex: 1 }} />

            <UI.Box sx={{ padding: 2, gap: 2, display: "flex", }}>
                <UI.Button variant="outlined" onClick={goBack} fullWidth>
                    Back
                </UI.Button>

                <UI.Button variant="contained" onClick={() => dispatch(['StartGame', { userId: currentUserId }])} fullWidth disabled={startGameRes.type === 'Err'}>
                    Start Game
                </UI.Button>
            </UI.Box>
        </UI.FillBox>
    )
}
