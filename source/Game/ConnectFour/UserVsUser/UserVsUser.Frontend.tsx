import { Cmd, Sub } from "../../../Core";
import * as UI from "../../../UI";
import * as Store from "../../../Store";
import { gameTheme, PlayerType, playerTypeToColor } from "../ConnectFour";
import { PlayerIcon, PlayerOneIcon, PlayerTwoIcon } from "../Views";
import { FrontendModel, FrontendMsg, initShared, ToFrontend } from "./UserVsUser.Types";
import { UserId } from "../../../Data";


//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = ({ sendToBackend, }: { sendToBackend: (msg: Msg) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'StopPlaying':
        case "StartPlaying": {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'StopPlaying_Done':
        case "StartPlaying_Done": {
            const modelNew = msg[1].type === 'Err' ? model : msg[1].value
            return [modelNew, Cmd.None]
        }
    }
};

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

// 
// 
// 
// View
// 
// 
// 

const avatarSx: UI.Sx = {
    // width: 36,
    // height: 36,
}
const iconSx: UI.Sx = {
    width: 64,
    height: 64,
}

export const View = ({ currentUserId, model, dispatch, store, roomComponent, goBack, goHome }: { model: Model, store: Store.Model; dispatch: (msg: Msg) => void, roomComponent: UI.ViewNode, goBack: () => void, goHome: () => void, currentUserId: UserId.UserId }) => {
    const homeButton = (
        <UI.IconButton sx={{ marginLeft: -1 }} onClick={goHome}>
            <UI.Icons.Home />
        </UI.IconButton>
    )

    return (
        <UI.FillBox>
            <UI.Header left={homeButton} title="Connect Four" right={roomComponent} />

            {/* 
            
            header
            
            */}

            <UI.Box
                sx={{
                    paddingY: 6,
                    paddingX: 2,
                    background: `linear-gradient(${gameTheme.primary.dark}, ${gameTheme.primary.darker})`,
                    display: 'flex',
                    flexDirection: "row",
                    justifyContent: 'center',
                    alignItems: "center",
                    gap: 2
                }}
            >
                <UI.Box sx={{ width: 72, overflow: "hidden", textAlign: "center" }}>
                    <UI.Avatar sx={{ ...avatarSx, marginX: "auto" }} src={model.PlayerOne === 'None' ? "" : store.Profile[model.PlayerOne]?.avatarUrl} >
                        <UI.Icons.QuestionMark />
                    </UI.Avatar>
                    <UI.Typography color="#fff" align='center' noWrap>
                        {model.PlayerOne === 'None' ? "?" : store.Profile[model.PlayerOne]?.username ?? "..."}
                    </UI.Typography>
                </UI.Box>
                <PlayerOneIcon sx={{ ...iconSx }} />
                <UI.Typography color="#fff" sx={{ fontSize: 32 }}>
                    vs
                </UI.Typography>
                <PlayerTwoIcon sx={{ ...iconSx }} />
                <UI.Box sx={{ width: 72, overflow: "hidden", textAlign: "center" }}>
                    <UI.Avatar sx={{ ...avatarSx, marginX: "auto" }} src={model.PlayerTwo === 'None' ? "" : store.Profile[model.PlayerTwo]?.avatarUrl} >
                        <UI.Icons.QuestionMark />
                    </UI.Avatar>
                    <UI.Typography color="#fff" align='center' noWrap>
                        {model.PlayerTwo === 'None' ? "?" : store.Profile[model.PlayerTwo]?.username ?? "..."}
                    </UI.Typography>
                </UI.Box>
            </UI.Box>

            {/* 
            

            Players
            

            */}

            <UI.Typography
                color="text.secondary"
                sx={{ paddingX: 2, paddingTop: 2, paddingBottom: 1 }}
            >
                Players
            </UI.Typography>

            <ViewSetupPlayerSlot
                store={store}
                currentUserId={currentUserId}
                playerType={"PlayerOne"}
                userId={model.PlayerOne}
                dispatch={dispatch}
            />

            <ViewSetupPlayerSlot
                store={store}
                currentUserId={currentUserId}
                playerType={"PlayerTwo"}
                userId={model.PlayerTwo}
                dispatch={dispatch}
            />
            {/* 
            
            
            
            
            */}

            <UI.Divider sx={{ paddingBottom: 2 }} />

            <UI.Box sx={{ flex: 1 }} />

            <UI.Box sx={{ padding: 2, gap: 2, display: 'flex' }}>
                <UI.Button variant="outlined" fullWidth onClick={goBack}>
                    Back
                </UI.Button>
                <UI.Button variant="contained" fullWidth>
                    Start Game
                </UI.Button>
            </UI.Box>
        </UI.FillBox>
    )
}


const ViewSetupPlayerSlot = ({ dispatch, userId, store, currentUserId, playerType }: { dispatch: (msg: Msg) => void, playerType: PlayerType, userId: "None" | UserId.UserId, store: Store.Model, currentUserId: UserId.UserId, }) => {
    return (
        <UI.Box sx={{ paddingX: 2, display: 'flex', paddingBottom: 2, alignItems: 'center' }}>
            <PlayerIcon playerType={playerType} sx={{ width: 42, height: 42, marginRight: 1 }} />
            {userId === 'None' ? (
                <UI.Button fullWidth variant="contained" onClick={() => dispatch(['StartPlaying', { userId: currentUserId, playerType }])}>
                    Play as {playerTypeToColor[playerType]}
                </UI.Button>
            ) : (
                <UI.Box sx={{ display: "flex", alignItems: "center", overflow: "hidden", flex: 1 }}>
                    <UI.Avatar src={store.Profile[userId]?.avatarUrl} sx={{ marginRight: 1 }} />
                    <UI.Typography noWrap sx={{ flex: 1 }}>
                        {store.Profile[userId]?.username ?? "..."}
                    </UI.Typography>
                    {userId === currentUserId && (
                        <UI.Button onClick={() => dispatch(['StopPlaying', { userId: currentUserId, }])}>
                            Stop Playing
                        </UI.Button>
                    )}
                </UI.Box>
            )}
        </UI.Box>
    )
}

