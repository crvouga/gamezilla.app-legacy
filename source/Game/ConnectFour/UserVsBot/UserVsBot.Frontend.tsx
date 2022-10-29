import { Cmd, Sub } from "../../../Core";
import { UserId } from "../../../Data/UserId";
import * as Snackbar from "../../../Snackbar";
import * as Store from "../../../Store";
import * as UI from "../../../UI";
import { VersusHeader } from "../../Views";
import { gameTheme, ViewColumns } from "../ConnectFour";
import { PlayerIcon } from "../Views";
import { GameOverModel, SetupModel, GameModel, BackendModel, FrontendModel, FrontendMsg, handle, initShared, ToBackend, ToFrontend } from "./UserVsBot.Types";

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

    if (model.type === 'GameOver') {
        return (
            <ViewGameOver
                model={model}
                store={store}
                roomComponent={roomComponent}
                goHome={goHome}
                currentUserId={currentUserId}
                dispatch={dispatch}
            />
        )
    }

    return (
        <ViewGame
            model={model}
            store={store}
            roomComponent={roomComponent}
            goHome={goHome}
            currentUserId={currentUserId}
            dispatch={dispatch}
        />
    )
}

const ViewGameOver = (
    {
        model,
        roomComponent,
        goHome,
    }: {
        model: GameOverModel;
        dispatch: (msg: Msg) => void;
        currentUserId: UserId;
        store: Store.Model;
        goHome: () => void;
        roomComponent: UI.ViewNode;
    }) => {
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

            <ViewColumns
                columns={model.columns}
            />

            <UI.Box sx={{ flex: 1 }} />

            <UI.Box sx={{ display: 'flex' }}>


            </UI.Box>
        </UI.FillBox>
    )
}

const ViewGame = (
    {
        model,
        roomComponent,
        goHome,
        dispatch,
        currentUserId
    }: {
        model: GameModel;
        dispatch: (msg: Msg) => void;
        currentUserId: UserId;
        store: Store.Model;
        goHome: () => void;
        roomComponent: UI.ViewNode;
    }) => {

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

            <ViewColumns
                columns={model.columns}
                onClick={columnIndex => dispatch(['InputMove', { columnIndex, userId: currentUserId }])}
            />
        </UI.FillBox>
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

            <UI.Typography sx={{ paddingX: 2, paddingTop: 2, }} color="text.secondary">
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


            <UI.Divider sx={{ paddingY: 2 }} />


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
