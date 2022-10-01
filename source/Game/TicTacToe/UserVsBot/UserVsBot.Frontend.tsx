import { Cmd, Sub } from "../../../Core";
import * as UI from "../../../UI";
import * as Store from "../../../Store";
import { playerTypes, ViewBoard, ViewSlot } from "../TicTacToe";
import { BannerArt } from "../Views";
import { BackendModel, botLevels, FrontendModel, FrontendMsg, initSharedModel, startGame, ToBackend, ToFrontend } from "./UserVsBot.Types";
import { UserId } from "../../../Data";

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = initSharedModel

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'StartGame':
        case 'StopPlaying':
        case 'StartPlaying':
        case "InputBot":
        case 'InputPlayerType': {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'StartGame_Done':
        case 'StartPlaying_Done':
        case 'StopPlaying_Done':
        case 'InputBot_Done':
        case 'InputPlayerType_Done': {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }
            return [msg[1].value, Cmd.None]
        }

    }
}

export const mergeWithBackend = (frontendModel: FrontendModel, backendModel: BackendModel): FrontendModel => {
    return backendModel
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


// 
// 
// 
// View
// 
// 
// 

export const View = ({ goBack, model, dispatch, goHome, roomAvatarGroup, store, currentUserId }: { currentUserId: UserId.UserId, store: Store.Model; goBack: () => void; goHome: () => void, model: Model, dispatch: (msg: Msg) => void, roomAvatarGroup: UI.ViewNode }) => {

    const homeButton = <UI.IconButton sx={{ marginLeft: -1 }} onClick={goHome}><UI.Icons.Home /></UI.IconButton>
    const theme = UI.useTheme()

    if (model.type === 'Setup') {
        const startGameResult = startGame({ userId: currentUserId }, model)

        return <UI.FillBox>
            <UI.Header
                left={homeButton}
                title=""
                right={roomAvatarGroup}
            />
            <UI.Box sx={{ flex: 1, overflowY: "scroll" }}>
                <BannerArt title="Vs Bot" />

                <UI.Typography color="text.secondary" sx={{ paddingX: 2, paddingTop: 2, paddingBottom: 1 / 2 }}>
                    Player
                </UI.Typography>

                <UI.Box sx={{ paddingX: 2, paddingBottom: 2 }}>
                    {model.player === 'None' ? (
                        <UI.Button fullWidth variant="contained" onClick={() => dispatch(['StartPlaying', { userId: currentUserId }])}>
                            Start Playing
                        </UI.Button>
                    ) : (
                        <UI.Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <UI.Avatar src={store.Profile[model.player]?.avatarUrl} sx={{ marginRight: 1 }} />
                            <UI.Typography sx={{ flex: 1 }}>
                                {store.Profile[model.player]?.username ?? "..."}
                            </UI.Typography>
                            {model.player === currentUserId && <UI.Button onClick={() => dispatch(['StopPlaying', { userId: currentUserId }])}>
                                Stop Playing
                            </UI.Button>}
                        </UI.Box>
                    )}
                </UI.Box>

                <UI.Divider />

                <UI.Typography color="text.secondary" sx={{ paddingBottom: 1 / 2, paddingTop: 2, paddingX: 2 }}>
                    Play As
                </UI.Typography>
                <UI.ToggleButtonGroup fullWidth value={model.userPlayerType} sx={{ marginBottom: 2, paddingX: 2 }}>
                    {Object.values(playerTypes).map(playerType => (
                        <UI.ToggleButton value={playerType} key={playerType} onClick={() => dispatch(['InputPlayerType', { playerType, userId: currentUserId }])}>
                            <UI.SvgIcon viewBox="-1 -1 2 2">
                                <ViewSlot cx={0} cy={0} slot={playerType} r={0.8} color="currentColor" strokeWidth={0.33} />
                            </UI.SvgIcon>
                        </UI.ToggleButton>
                    ))}
                </UI.ToggleButtonGroup>

                <UI.Typography color="text.secondary" sx={{ marginBottom: 1 / 2, paddingX: 2 }}>
                    Bot Level
                </UI.Typography>
                <UI.ToggleButtonGroup sx={{ marginBottom: 2, paddingX: 2 }} fullWidth value={model.botLevel} >
                    {Object.values(botLevels).map(botLevel => (
                        <UI.ToggleButton value={botLevel} key={botLevel} onClick={() => dispatch(['InputBot', { userId: currentUserId, botLevel }])}>
                            {botLevel}
                        </UI.ToggleButton>
                    ))}
                </UI.ToggleButtonGroup>
            </UI.Box>


            <UI.Box sx={{ padding: 2, display: 'flex', gap: 2, borderTop: `solid 1px ${theme.palette.divider}` }}>
                <UI.Button fullWidth variant="outlined" onClick={goBack}>
                    Back
                </UI.Button>
                <UI.Button fullWidth variant="contained" disabled={startGameResult.type === "Err"} onClick={() => dispatch(['StartGame', { userId: currentUserId }])}>
                    Start Game
                </UI.Button>
            </UI.Box>
        </UI.FillBox >
    }
    return <UI.FillBox>
        <UI.Header left={homeButton} title="" right={roomAvatarGroup} />
        <UI.Box sx={{ flex: 1 }}>
            <ViewBoard board={model.board} onClick={() => { }} />
        </UI.Box>

        <UI.Box sx={{ display: 'flex' }}>
            <UI.ActionButton
                onClick={() => {
                    // dispatch(['StopGame', { userId: currentUserId }])
                }}
                icon={<UI.Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />}
                label="Exit"
            />
            <UI.ActionButton
                onClick={() => { }}
                icon={<UI.Icons.SwapHoriz />}
                label="Swap"
            />
            <UI.ActionButton
                onClick={() => { }}
                icon={<UI.Icons.RestartAlt />}
                label="Reset"
            />
        </UI.Box>

    </UI.FillBox>
}