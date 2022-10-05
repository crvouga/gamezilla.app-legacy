import { Cmd, Sub } from "../../../Core";
import * as UI from "../../../UI";
import * as Store from "../../../Store";
import { theme, PlayerType, playerTypes, ViewBoard, ViewSlot, toTurn } from "../TicTacToe";
import { BannerArt } from "../Views";
import { GameModel, BackendModel, botLevels, FrontendModel, FrontendMsg, initSharedModel, startGame, ToBackend, ToFrontend, inputBot, inputPlayerType, inputPlayerTypeToString, inputBotToString } from "./UserVsBot.Types";
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
        case 'StopGame':
        case 'InputMove':
        case 'Restart':
        case 'SwapSides':
        case 'InputPlayerType': {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'BotMove_Done':
        case 'StartGame_Done':
        case 'StartPlaying_Done':
        case 'StopPlaying_Done':
        case 'InputBot_Done':
        case 'StopGame_Done':
        case 'InputMove_Done':
        case 'Restart_Done':
        case 'SwapSides_Done':
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
    const uiTheme = UI.useTheme()

    if (model.type === 'Setup') {
        const startGameResult = startGame({ userId: currentUserId }, model)
        const inputBotResult = inputBot({ userId: currentUserId, botLevel: model.botLevel }, model)
        const inputPlayerTypeResult = inputPlayerType({ userId: currentUserId, playerType: model.userPlayerType }, model)



        return <UI.FillBox>
            <UI.Header
                left={homeButton}
                title=""
                right={roomAvatarGroup}
            />
            <UI.Box sx={{ flex: 1, overflowY: "scroll" }}>
                <UI.Box sx={{ width: "100%", display: 'flex', alignItems: "center", justifyContent: 'center', color: "#fff", backgroundColor: theme.background, }}>
                    <ViewHeaderPlayerSlot playerType="X" model={model} store={store} />
                    <UI.Box sx={{ display: 'flex', alignItems: "center", justifyContent: 'center', }}>
                        <UI.Typography align="center" sx={{ fontSize: 24, color: "inherit" }}>vs</UI.Typography>
                    </UI.Box>
                    <ViewHeaderPlayerSlot playerType="O" model={model} store={store} />
                </UI.Box>

                <UI.Typography color="text.secondary" sx={{ paddingX: 2, paddingTop: 2, paddingBottom: 1 }}>
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

                <UI.Typography color="text.secondary" sx={{ paddingBottom: 1, paddingTop: 2, paddingX: 2 }}>
                    Play As
                </UI.Typography>
                <UI.Tooltip title={inputPlayerTypeToString(inputPlayerTypeResult)}>
                    <UI.ToggleButtonGroup fullWidth value={model.userPlayerType} sx={{ marginBottom: 2, paddingX: 2 }} disabled={inputPlayerTypeResult.type === 'Err'}>
                        {Object.values(playerTypes).map(playerType => (
                            <UI.ToggleButton value={playerType} key={playerType} onClick={() => dispatch(['InputPlayerType', { playerType, userId: currentUserId }])}>
                                <UI.SvgIcon viewBox="-1 -1 2 2">
                                    <ViewSlot cx={0} cy={0} slot={playerType} r={0.8} color="currentColor" strokeWidth={0.33} />
                                </UI.SvgIcon>
                            </UI.ToggleButton>
                        ))}
                    </UI.ToggleButtonGroup>
                </UI.Tooltip>

                <UI.Typography color="text.secondary" sx={{ marginBottom: 1, paddingX: 2 }}>
                    Bot Level
                </UI.Typography>
                <UI.Tooltip title={inputBotToString(inputBotResult)}>
                    <UI.ToggleButtonGroup disabled={inputBotResult.type === "Err"} sx={{ marginBottom: 2, paddingX: 2 }} fullWidth value={model.botLevel} >
                        {Object.values(botLevels).map(botLevel => (
                            <UI.ToggleButton value={botLevel} key={botLevel} onClick={() => dispatch(['InputBot', { userId: currentUserId, botLevel }])}>
                                {botLevel}
                            </UI.ToggleButton>
                        ))}
                    </UI.ToggleButtonGroup>
                </UI.Tooltip>
            </UI.Box>


            <UI.Box sx={{ padding: 2, display: 'flex', gap: 2, borderTop: `solid 1px ${uiTheme.palette.divider}` }}>
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

        <UI.Box sx={{ flex: 1, }}>
            <UI.Box sx={{ display: 'flex', padding: 1, gap: 1, paddingTop: 0 }}>
                <ViewPlayerGameSlot model={model} playerType="X" store={store} />
                <ViewPlayerGameSlot model={model} playerType="O" store={store} />
            </UI.Box>

            <ViewBoard board={model.board} onClick={(position) => dispatch(['InputMove', { userId: currentUserId, position }])} />
        </UI.Box>

        <UI.Box sx={{ display: 'flex' }}>
            <UI.ActionButton
                onClick={() => {
                    dispatch(['StopGame', { userId: currentUserId }])
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
                onClick={() => dispatch(['Restart', { userId: currentUserId }])}
                icon={<UI.Icons.RestartAlt />}
                label="Reset"
            />
        </UI.Box>

    </UI.FillBox>
}


const ViewHeaderPlayerSlot = ({ playerType, model, store, }: { playerType: PlayerType, model: Model, store: Store.Model, }) => {
    const iconSx = { width: 42, height: 42, }

    const largeIconSx = { width: 64, height: 64 }
    return (
        <UI.Box sx={{
            flex: 1, width: "100%", height: "100%", overflow: "hidden",
            display: 'flex', alignItems: "center", justifyContent: 'center',
            gap: 2,
            flexDirection: playerType === 'X' ? 'row' : 'row-reverse',
            paddingY: 4,
            paddingX: 2,
        }}>
            <UI.Box sx={{ flex: 1, width: "100%", height: "100%", display: 'flex', alignItems: "center", justifyContent: 'center', flexDirection: "column", }}>
                {model.userPlayerType === playerType ? (
                    <>
                        <UI.Avatar src={model.player === "None" ? "" : store.Profile[model.player]?.avatarUrl} sx={{ ...iconSx }} >
                            <UI.Icons.QuestionMark />
                        </UI.Avatar>
                        <UI.Typography variant="caption" color="inherit" noWrap sx={{ textOverflow: "ellipsis" }}>
                            {model.player === "None" ? "?" : store.Profile[model.player]?.username}
                        </UI.Typography>
                    </>
                ) : (
                    <>
                        <UI.Icons.SmartToy sx={{ ...iconSx }} />
                        <UI.Typography variant="caption" color="inherit" noWrap>
                            {model.botLevel}
                        </UI.Typography>
                    </>
                )}
            </UI.Box>
            <UI.Box sx={{ flex: 1, width: "100%", display: 'flex', alignItems: "center", justifyContent: 'center', flexDirection: "column" }}>
                <UI.SvgIcon sx={{ ...largeIconSx }} viewBox="-1 -1 2 2">
                    <ViewSlot cx={0} cy={0} r={0.8} slot={playerType} strokeWidth={0.3} />
                </UI.SvgIcon>
            </UI.Box>
        </UI.Box>
    )
}


export const ViewPlayerGameSlot = ({
    store,
    playerType,
    model,
}: {
    model: GameModel,
    store: Store.Model
    playerType: PlayerType,
}) => {
    const uiTheme = UI.useTheme()

    const iconSize = {
        width: 20,
        height: 20,
    }

    const isTurn = toTurn(model.board) === playerType

    return (
        <UI.Paper sx={{ flex: 1, overflow: "hidden", height: "100%", width: '100%' }} variant="outlined">
            <UI.Box
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    overflow: "hidden",
                    borderBottom: `solid 3.5px ${isTurn ? theme.background : uiTheme.palette.divider}`,
                }}

            >
                <UI.Box sx={{ display: 'flex', flexDirection: "row", padding: 1, flex: 2, overflow: "hidden", alignItems: 'center' }}>
                    <UI.SvgIcon sx={{ display: "block", marginRight: 1, ...iconSize, }} viewBox="-1 -1 2 2" >
                        <ViewSlot strokeWidth={0.3} color={uiTheme.palette.text.primary} slot={playerType} cx={0} cy={0} r={0.8} />
                    </UI.SvgIcon>
                    {model.userPlayerType === playerType ? (
                        <>
                            <UI.Avatar
                                src={store.Profile[model.player]?.avatarUrl}
                                sx={{ marginRight: 1, ...iconSize, }} />
                            <UI.Typography noWrap sx={{ flex: 1 }}>
                                {store.Profile[model.player]?.username ?? "..."}
                            </UI.Typography>
                        </>
                    ) : (
                        <>
                            <UI.Icons.SmartToy sx={{ marginRight: 1, ...iconSize }} />
                            <UI.Typography noWrap sx={{ flex: 1 }}>
                                {model.botLevel}
                            </UI.Typography>
                        </>
                    )}
                </UI.Box>
            </UI.Box>
        </UI.Paper>
    )
}