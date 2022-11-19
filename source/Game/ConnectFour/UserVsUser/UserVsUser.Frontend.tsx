import { Cmd, exhaustive, Sub } from "../../../Core";
import { UserId } from "../../../Data";
import * as ProfileStore from "../../../Profile/Profile.Store";
import * as Snackbar from "../../../Snackbar";
import * as UI from "../../../UI";
import { Ctx } from "../../Game.Shared";
import { ColumnIndex, gameTheme, PlayerType, playerTypeToColor, toTurn, ViewColumns } from "../ConnectFour";
import { PlayerIcon, PlayerOneIcon, PlayerTwoIcon } from "../Views";
import { allMoveTimeLimit, BackendModel, FrontendModel, FrontendMsg, GameModel, GameOverModel, handle, initShared, resultToString, SetupModel, ToBackend, ToFrontend, toPlayerType } from "./UserVsUser.Types";


//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = ({ PlayerOne, PlayerTwo }: Pick<FrontendModel, 'PlayerOne' | "PlayerTwo">): FrontendModel => {
    return {
        ...initShared({ PlayerOne, PlayerTwo }),
        ghostIndex: "None",
        openedModal: "None"
    }
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = Snackbar.Action

export const update = ({ sendToBackend, }: { sendToBackend: (msg: ToBackend) => Cmd }, msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {

        // 
        //
        //
        //
        //

        case 'ClickedResign': {
            return [{ ...model, openedModal: "ConfirmResign" }, Cmd.None]
        }

        case 'HoveredOverColumns': {
            const { columnIndex } = msg[1]
            return [{ ...model, ghostIndex: columnIndex }, Cmd.None]
        }

        case 'CloseModal': {
            return [{ ...model, openedModal: 'None' }, Cmd.None]
        }

        // 
        //
        //
        //
        // 

        case 'Resign':
        case 'NewGame':
        case 'Rematch_Request':
        case 'Rematch_Respond':
        case 'Rematch_Cancel':
        case 'InputMoveTimeLimit':
        case 'StartGame':
        case 'StopPlaying':
        case "StartPlaying": {
            return [model, sendToBackend(msg)]
        }
        case 'InputMove': {
            return [
                {
                    ...model,
                    // ghostIndex: "None"
                },
                sendToBackend(msg)
            ]
        }
        default: {
            return exhaustive(msg[0])
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>, OutAction[]] => {
    switch (msg[0]) {
        case 'NewGame':
        case 'InputMoveTimeLimit':
        case 'StartGame':
        case 'StopPlaying':
        case 'Rematch_Cancel':
        case 'Resign':
        case 'Rematch_Request':
        case 'Rematch_Respond':
        case "StartPlaying": {
            const modelNew = msg[1].type === 'Err' ? model : msg[1].value
            const merged = mergeWithBackend({ frontendModel: model, backendModel: modelNew })
            return [{ ...merged, openedModal: "None" }, Cmd.None, []]
        }

        case 'InputMove': {
            const modelNew = msg[1].type === 'Err' ? model : msg[1].value
            const merged = mergeWithBackend({ frontendModel: model, backendModel: modelNew })
            return [{ ...merged, ghostIndex: "None" }, Cmd.None, []]
        }

        case 'Tick_Done': {
            const merged = mergeWithBackend({ frontendModel: model, backendModel: msg[1] })
            return [merged, Cmd.None, []]
        }

        case 'PlayerLeft': {
            const merged = mergeWithBackend({ frontendModel: model, backendModel: msg[1] })
            return [merged, Cmd.None, []]
        }

        default: {
            return exhaustive(msg[0])
        }
    }

};

export const mergeWithBackend = ({ frontendModel, backendModel }: { frontendModel: FrontendModel, backendModel: BackendModel }): FrontendModel => {
    return {
        ...backendModel,
        openedModal: frontendModel.openedModal,
        ghostIndex: frontendModel.ghostIndex
    }
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


export const View = ({ ctx, model, dispatch, goBack, }: { model: Model, ctx: Ctx; dispatch: (msg: Msg) => void, goBack: () => void, }) => {

    if (model.type === 'Setup') {
        return (
            <ViewSetup
                ctx={ctx}
                goBack={goBack}
                model={model}
                dispatch={dispatch}
            />
        )
    }

    if (model.type === 'Game') {
        return (
            <>
                <ViewGame
                    ctx={ctx}
                    ghostIndex={model.ghostIndex}
                    model={model}
                    dispatch={dispatch}
                />

                <UI.ConformationDialog
                    headerIcon={<UI.Icons.Flag sx={{ width: 52, height: 52 }} />}
                    title="Resign from game?"
                    onCancel={() => dispatch(['CloseModal'])}
                    onClose={() => dispatch(['CloseModal'])}
                    confirmTitle="Resign"
                    onConfirm={() => dispatch(['Resign', { userId: currentUserId }])}
                    open={model.openedModal === 'ConfirmResign'}
                />
            </>
        )
    }

    return (
        <ViewGameOver
            model={model}
            ctx={ctx}
            dispatch={dispatch}
        />
    )
}

const ViewGame = ({
    currentUserId,
    model,
    dispatch,
    store,
    ghostIndex
}: {
    model: GameModel;
    store: ProfileStore.Model;
    dispatch: (msg: Msg) => void;
    currentUserId: UserId;
    ghostIndex: ColumnIndex | "None"
}) => {

    const currentUserPlayerType = toPlayerType(currentUserId, model)

    return (
        <UI.FillBox>
            <UI.Box sx={{ paddingX: 1, gap: 2, marginBottom: 2, display: 'flex', width: "100%", overflow: "hidden" }}>
                <ViewGamePlayerSlot playerType="PlayerOne" model={model} store={store} />
                <ViewGamePlayerSlot playerType="PlayerTwo" model={model} store={store} />
            </UI.Box>

            <UI.Box sx={{ position: "relative", overflow: "hidden" }}>
                <ViewColumns
                    columns={model.columns}
                    onClick={(columnIndex) => dispatch(['InputMove', { userId: currentUserId, columnIndex }])}
                    onHover={(columnIndex) => dispatch(['HoveredOverColumns', { columnIndex }])}
                    disabled={toTurn(model.columns) !== currentUserPlayerType}
                    ghost={
                        currentUserPlayerType !== "None" && ghostIndex !== 'None'
                            ? { playerType: currentUserPlayerType, columnIndex: ghostIndex }
                            : undefined
                    }
                />
            </UI.Box>

            <UI.Box sx={{ flex: 1 }} />

            <UI.Box sx={{ display: 'flex' }}>
                <UI.ActionButton
                    icon={<UI.Icons.Flag />}
                    label="Resign"
                    onClick={() => dispatch(['ClickedResign', { userId: currentUserId }])}
                />
                {/* <UI.ActionButton
                    icon={<UI.Icons.HandshakeTwoTone />}
                    label="Draw"
                    onClick={() => { }}
                /> */}
            </UI.Box>


        </UI.FillBox>
    )

}

const ViewGameOver = ({
    currentUserId,
    model,
    dispatch,
    store,
}: {
    model: GameOverModel,
    store: ProfileStore.Model;
    dispatch: (msg: Msg) => void,
    currentUserId: UserId,
}) => {
    return (
        <UI.FillBox>
            <UI.Box sx={{ paddingX: 1, gap: 2, marginBottom: 2, display: 'flex', width: "100%", overflow: "hidden" }}>
                <ViewGamePlayerSlot
                    playerType="PlayerOne"
                    model={model}
                    store={store}
                />
                <ViewGamePlayerSlot
                    playerType="PlayerTwo"
                    model={model}
                    store={store}
                />
            </UI.Box>

            <UI.Box sx={{ position: "relative", overflow: "hidden" }}>
                <ViewColumns columns={model.columns} disabled />

                {model.type === 'GameOver' && (
                    <UI.Fade in>
                        <UI.Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                maxHeight: "100%",
                                background: "rgba(0, 0, 0, 0.5)",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: "center",
                                flexDirection: "column",
                                color: "#fff",
                            }}
                        >
                            <ViewGameOverMessage dispatch={dispatch} currentUserId={currentUserId} store={store} model={model} />
                        </UI.Box>
                    </UI.Fade>
                )}
            </UI.Box>

            <UI.Box sx={{ flex: 1 }} />

            <UI.Box sx={{ display: 'flex', padding: 2, gap: 2 }}>
                <UI.Button variant="outlined" fullWidth onClick={() => dispatch(['NewGame', { userId: currentUserId }])}>
                    Back
                </UI.Button>

                <UI.Button variant="contained" fullWidth disabled={model.rematch.type === 'Asking'} onClick={() => dispatch(['Rematch_Request', { userId: currentUserId }])}>
                    Rematch
                </UI.Button>
            </UI.Box>

        </UI.FillBox>
    )
}

const ViewGameOverMessage = ({ currentUserId, model, store, dispatch }: { currentUserId: UserId, model: GameOverModel, store: ProfileStore.Model, dispatch: (msg: Msg) => void }) => {
    const size = { width: 84, height: 84 }

    const currentPlayerType = toPlayerType(currentUserId, model)

    if (model.rematch.type === 'Asking' && model.rematch.asker === currentPlayerType) {
        return <>
            <UI.Typography align="center" sx={{ fontSize: "2rem", marginBottom: 4 }} >
                Waiting for response
            </UI.Typography>
            <UI.CircularProgress sx={{ marginBottom: 4 }} />
            <UI.Button variant="contained" onClick={() => dispatch(['Rematch_Cancel', { userId: currentUserId }])}>
                Cancel
            </UI.Button>
        </>
    }

    if (model.rematch.type === 'Asking' && model.rematch.asker !== currentPlayerType && currentPlayerType !== null) {
        return <>
            <UI.Typography align="center" sx={{ fontSize: 54, marginBottom: 4 }} >
                Rematch?
            </UI.Typography>
            <UI.Box sx={{ display: 'flex', gap: 2 }}>
                <UI.Button variant="contained" color="inherit" sx={{ color: "#000" }} startIcon={<UI.Icons.Cancel />} onClick={() => dispatch(['Rematch_Respond', { response: "Decline", userId: currentUserId }])}>
                    Decline
                </UI.Button>
                <UI.Button variant="contained" startIcon={<UI.Icons.Done />} onClick={() => dispatch(['Rematch_Respond', { response: "Accept", userId: currentUserId }])}>
                    Accept
                </UI.Button>
            </UI.Box>
        </>
    }

    if (model.gameOver.type === 'Draw') {
        return <>
            <UI.Typography sx={{ fontSize: 64 }}>
                Tie
            </UI.Typography>
        </>
    }

    if (model.gameOver.type === 'Resignation') {
        const { resigner } = model.gameOver

        const winner: PlayerType = resigner === 'PlayerOne' ? 'PlayerTwo' : "PlayerOne"

        if (currentPlayerType === 'None') {
            return (
                <>
                    <UI.Box sx={{ display: 'flex', alignItems: 'center', width: "100%", justifyContent: 'center' }}>
                        <PlayerIcon sx={{ ...size, marginRight: 2 }} playerType={winner} />
                        <UI.Avatar sx={{ ...size }} src={store.profiles[model[winner]]?.avatarUrl} />
                    </UI.Box>
                    <UI.Typography sx={{ fontSize: 50 }}>
                        Winner
                    </UI.Typography>
                </>
            )
        }

        return (
            <>
                <UI.Typography sx={{ fontSize: 64 }}>
                    {currentPlayerType === winner ? 'You Won' : 'You Lost'}
                </UI.Typography>
                <UI.Typography >
                    by resignation
                </UI.Typography>
            </>
        )

    }

    if (model.gameOver.type === 'Winner') {
        const { winner } = model.gameOver


        if (currentPlayerType === 'None') {
            return (
                <>
                    <UI.Box sx={{ display: 'flex', alignItems: 'center', width: "100%", justifyContent: 'center' }}>
                        <PlayerIcon sx={{ ...size, marginRight: 2 }} playerType={winner} />
                        <UI.Avatar sx={{ ...size }} src={store.profiles[model[winner]]?.avatarUrl} />
                    </UI.Box>
                    <UI.Typography sx={{ fontSize: 50 }}>
                        Winner
                    </UI.Typography>
                </>
            )
        }

        return (
            <>
                <UI.Typography sx={{ fontSize: 64 }}>
                    {currentPlayerType === winner ? "You Won" : "You Lost"}
                </UI.Typography>
            </>
        )
    }


    return <></>
}

const ViewSetup = ({ model, store, dispatch, currentUserId, goBack }: { goBack: () => void, currentUserId: UserId, model: SetupModel, store: ProfileStore.Model, dispatch: (msg: Msg) => void, }) => {
    const startGameResult = handle(['StartGame', { userId: currentUserId }], model)
    const inputMoveTimeLimitResult = handle(['InputMoveTimeLimit', { moveTimeLimit: model.moveTimeLimit, userId: currentUserId }], model)

    return (
        <UI.FillBox>
            <ViewVersusHeader model={model} store={store} />

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

            <UI.Divider sx={{ paddingBottom: 2 }} />

            <UI.Typography
                color="text.secondary"
                sx={{ paddingX: 2, paddingTop: 2, paddingBottom: 1 }}
            >
                Time Limit
            </UI.Typography>

            <UI.Box sx={{ paddingX: 2 }}>
                <UI.Tooltip title={resultToString(inputMoveTimeLimitResult)}>
                    <UI.ToggleButtonGroup fullWidth value={model.moveTimeLimit} disabled={inputMoveTimeLimitResult.type === "Err"}>
                        {Object.values(allMoveTimeLimit).map(moveTimeLimit => (
                            <UI.ToggleButton key={moveTimeLimit} value={moveTimeLimit} onClick={() => dispatch(['InputMoveTimeLimit', { moveTimeLimit, userId: currentUserId }])}>
                                {`${moveTimeLimit} sec`}
                            </UI.ToggleButton>
                        ))}
                    </UI.ToggleButtonGroup>
                </UI.Tooltip>
            </UI.Box>

            <UI.Box sx={{ flex: 1 }} />

            <UI.Box sx={{ padding: 2, gap: 2, display: 'flex' }}>
                <UI.Button variant="outlined" fullWidth onClick={goBack}>
                    Back
                </UI.Button>
                <UI.Button
                    variant="contained"
                    fullWidth
                    disabled={startGameResult.type === 'Err'}
                    onClick={() => dispatch(['StartGame', { userId: currentUserId }])}
                >
                    Start Game
                </UI.Button>
            </UI.Box>
        </UI.FillBox>
    )

}

const ViewGamePlayerSlot = ({ model, playerType, store }: { model: GameModel | GameOverModel, playerType: PlayerType, store: ProfileStore.Model }) => {
    const size = { width: 32, height: 32, }
    return (
        <UI.Box sx={{ display: 'flex', alignItems: 'center', flex: 1, overflow: "hidden" }}>
            <PlayerIcon playerType={playerType} sx={{ ...size, marginRight: 1 }} />
            <UI.Avatar src={store.profiles[model[playerType]]?.avatarUrl} sx={{ ...size, marginRight: 1 }} />
            <UI.Typography noWrap>
                {store.profiles[model[playerType]]?.username ?? "..."}
            </UI.Typography>
            {model.type === 'Game' && toTurn(model.columns) === playerType && (
                <UI.Typography sx={{ marginLeft: 1, fontSize: 20 }}>
                    {model.moveCountDown}
                </UI.Typography>
            )}
        </UI.Box>
    )
}


const ViewSetupPlayerSlot = ({ dispatch, userId, store, currentUserId, playerType }: { dispatch: (msg: Msg) => void, playerType: PlayerType, userId: "None" | UserId, store: ProfileStore.Model, currentUserId: UserId, }) => {
    return (
        <UI.Box sx={{ paddingX: 2, display: 'flex', paddingBottom: 2, alignItems: 'center' }}>
            <PlayerIcon playerType={playerType} sx={{ width: 42, height: 42, marginRight: 1 }} />
            {userId === 'None' ? (
                <UI.Button fullWidth variant="contained" onClick={() => dispatch(['StartPlaying', { userId: currentUserId, playerType }])}>
                    Play as {playerTypeToColor[playerType]}
                </UI.Button>
            ) : (
                <UI.Box sx={{ display: "flex", alignItems: "center", overflow: "hidden", flex: 1 }}>
                    <UI.Avatar src={store.profiles[userId]?.avatarUrl} sx={{ marginRight: 1 }} />
                    <UI.Typography noWrap sx={{ flex: 1 }}>
                        {store.profiles[userId]?.username ?? "..."}
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

const ViewVersusHeader = ({ model, store, }: { model: SetupModel, store: ProfileStore.Model }) => {
    const avatarSx: UI.Sx = {
        // width: 36,
        // height: 36,
    }
    const iconSx: UI.Sx = {
        width: 52,
        height: 52,
    }


    return (
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
                <UI.Avatar sx={{ ...avatarSx, marginX: "auto" }} src={model.PlayerOne === 'None' ? "" : store.profiles[model.PlayerOne]?.avatarUrl} >
                    <UI.Icons.QuestionMark />
                </UI.Avatar>
                <UI.Typography color="#fff" align='center' noWrap>
                    {model.PlayerOne === 'None' ? "?" : store.profiles[model.PlayerOne]?.username ?? "..."}
                </UI.Typography>
            </UI.Box>
            <PlayerOneIcon sx={{ ...iconSx }} />
            <UI.Typography color="#fff" sx={{ fontSize: 32 }}>
                vs
            </UI.Typography>
            <PlayerTwoIcon sx={{ ...iconSx }} />
            <UI.Box sx={{ width: 72, overflow: "hidden", textAlign: "center" }}>
                <UI.Avatar sx={{ ...avatarSx, marginX: "auto" }} src={model.PlayerTwo === 'None' ? "" : store.profiles[model.PlayerTwo]?.avatarUrl} >
                    <UI.Icons.QuestionMark />
                </UI.Avatar>
                <UI.Typography color="#fff" align='center' noWrap>
                    {model.PlayerTwo === 'None' ? "?" : store.profiles[model.PlayerTwo]?.username ?? "..."}
                </UI.Typography>
            </UI.Box>
        </UI.Box>

    )
}