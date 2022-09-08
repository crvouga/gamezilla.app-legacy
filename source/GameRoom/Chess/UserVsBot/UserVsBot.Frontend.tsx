import { Audio, Cmd, exhaustive, Option, Sub, tag } from "../../../Core"
import { UserId } from "../../../Data"
import * as Store from "../../../Store"
import * as UI from "../../../UI"
import {
    BackendModel,
    canStartGame,
    FrontendModel,
    FrontendMsg,
    initShared,
    ToBackend,
    ToFrontend
} from "./UserVsBot.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }): [FrontendModel, Cmd.Cmd<Msg>] => {
    return [
        {
            sharedModel: initShared,
            openedMenuId: Option.None,
            openedModal: "None",
            isFlipped: false,
        },
        sendToBackend(['Init'])
    ]
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = (
    { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> },
    msg: Msg,
    _model: Model,
): [Model, Cmd.Cmd<Msg>] => {
    const model: Model = { ..._model, openedMenuId: Option.None }
    switch (msg[0]) {

        case 'Audio_Done': {
            return [model, Cmd.None]
        }

        case 'OpenedMenu': {
            return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None]
        }

        case 'ClosedMenu': {
            return [{ ...model, openedMenuId: Option.None }, Cmd.None]
        }

        case 'InputUser': {
            return [model, sendToBackend(msg)]
        }

        case 'InputColor': {
            return [model, sendToBackend(msg)]
        }

        case 'InputBot': {
            return [model, sendToBackend(msg)]
        }

        default: {
            return exhaustive(msg[0])
        }
    }
}



export const updateFromBackend = (
    msg: ToFrontend,
    model: Model,
): [Model, Cmd.Cmd<Msg>] => {

    switch (msg[0]) {
        case 'Sync': {
            return [model, Cmd.None]
        }

        case 'GameOver': {
            return [model, Cmd.None]
        }


        case 'InputUser_Done': {
            const result = msg[2]

            if (result.type === 'Err') {
                return [model, Cmd.None]
            }

            const sharedModelNew = result.value

            const modelNew = mergeWithBackend(model, sharedModelNew)

            return [modelNew, Cmd.None]
        }


        case 'InputColor_Done': {
            const result = msg[1]

            if (result.type === 'Err') {
                return [model, Cmd.None]
            }

            const sharedModelNew = result.value

            const modelNew = mergeWithBackend(model, sharedModelNew)

            return [modelNew, Cmd.None]
        }

        case 'InputBot_Done': {
            const result = msg[1]

            if (result.type === 'Err') {
                return [model, Cmd.None]
            }

            const sharedModelNew = result.value

            const modelNew = mergeWithBackend(model, sharedModelNew)

            return [modelNew, Cmd.None]
        }

        default: {
            return exhaustive(msg[0])
        }
    }
}


const playAudio = (src: string): Cmd.Cmd<Msg> => {
    return Audio.play(src, tag("Audio_Done"))
}

// 
// 
// 
// 
// 
// 
// 


export const mergeWithBackend = (frontendModel: FrontendModel, backendModel: BackendModel): FrontendModel => {
    return {
        isFlipped: frontendModel.isFlipped,
        openedMenuId: frontendModel.openedMenuId,
        openedModal: frontendModel.openedModal,
        sharedModel: backendModel
    }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
    return Sub.None
}


//
//
//
// View
//
//
//

export const View =
    (
        {
            currentUserId,
            store,
            model,
            dispatch,
            onBack,
            roomAvatarGroup
        }: {
            store: Store.Model
            currentUserId: UserId.UserId
            model: Model,
            dispatch: (msg: Msg) => void
            onBack: () => void,
            roomAvatarGroup: UI.ViewNode,
        },

    ) => {
        // const { boardWidth, ref } = useBoardWidth([model.sharedModel.type])

        if (model.sharedModel.type === 'Setup') {
            return (
                <UI.FillBox>
                    <UI.Toolbar >
                        <UI.Box sx={{ flex: 1 }}>
                            <UI.Button onClick={onBack} sx={{ marginLeft: -1 }} startIcon={<UI.Icons.ChevronLeft />} >
                                Back
                            </UI.Button>
                        </UI.Box>
                        <UI.Typography align="center" sx={{ flex: 1 }} variant="h6">
                            User Vs Bot
                        </UI.Typography>
                        <UI.Box sx={{ flex: 1 }}>
                            {roomAvatarGroup}
                        </UI.Box>
                    </UI.Toolbar>

                    <UI.Typography sx={{ paddingX: 2, }} color="text.secondary">
                        Player
                    </UI.Typography>

                    <UI.Box sx={{ height: "64px" }}>
                        {model.sharedModel.userId.type === 'None' ? (
                            <UI.Box sx={{ paddingX: 2, paddingY: 1 }}>
                                <UI.Button
                                    fullWidth
                                    size="large"
                                    variant="contained"
                                    onClick={() => {
                                        dispatch([
                                            "InputUser",
                                            { userId: Option.Some(currentUserId) },
                                        ])
                                    }}>
                                    Play
                                </UI.Button>
                            </UI.Box>
                        ) : (
                            <ViewInputUserPlayerSlot
                                userId={model.sharedModel.userId.value}
                                currentUserId={currentUserId}
                                dispatch={dispatch}
                                model={model}
                                store={store}
                            />
                        )}
                    </UI.Box>

                    <UI.Typography sx={{ paddingX: 2, }} color="text.secondary">
                        Color
                    </UI.Typography>

                    <UI.Box sx={{ paddingX: 2, paddingBottom: 2 }}>
                        <UI.ToggleButtonGroup fullWidth value={model.sharedModel.userColor}>
                            <UI.ToggleButton value="w" onClick={() => dispatch(['InputColor', { userColor: "w", userId: currentUserId }])}>
                                White
                            </UI.ToggleButton>
                            <UI.ToggleButton value="b" onClick={() => dispatch(['InputColor', { userColor: "b", userId: currentUserId }])}>
                                Black
                            </UI.ToggleButton>
                        </UI.ToggleButtonGroup>
                    </UI.Box>

                    <UI.Typography sx={{ paddingX: 2, }} color="text.secondary">
                        Bot
                    </UI.Typography>

                    <UI.Box sx={{ paddingX: 2 }}>
                        <UI.ToggleButtonGroup fullWidth value={model.sharedModel.botDifficulty}>
                            <UI.ToggleButton value="Easy" onClick={() => dispatch(['InputBot', { botDifficulty: "Easy", userId: currentUserId }])}>
                                Easy
                            </UI.ToggleButton>
                            <UI.ToggleButton value="Medium" onClick={() => dispatch(['InputBot', { botDifficulty: "Medium", userId: currentUserId }])}>
                                Medium
                            </UI.ToggleButton>
                            <UI.ToggleButton value="Hard" onClick={() => dispatch(['InputBot', { botDifficulty: "Hard", userId: currentUserId }])}>
                                Hard
                            </UI.ToggleButton>
                        </UI.ToggleButtonGroup>
                    </UI.Box>

                    <UI.Box sx={{ flex: 1 }} />

                    <UI.Box sx={{ paddingX: 2, paddingBottom: 1 }}>
                        <UI.Button fullWidth size="large" variant="contained" disabled={!canStartGame(model.sharedModel)}>
                            Start Game
                        </UI.Button>
                    </UI.Box>
                </UI.FillBox>
            )
        }

        return <UI.FillBox>
            game time
        </UI.FillBox>

    }

const ViewInputUserPlayerSlot = ({
    dispatch,
    store,
    userId,
    model,
    currentUserId,
}: {
    dispatch: (msg: Msg) => void,
    store: Store.Model,
    userId: UserId.UserId,
    model: Model,
    currentUserId: UserId.UserId
}) => {
    const anchorId = `${userId}`
    return (
        <>
            <UI.ListItemButton id={anchorId} onClick={() => dispatch(['OpenedMenu', anchorId])}>
                <UI.ListItemAvatar>
                    <UI.Avatar src={store.Profile[userId]?.avatarUrl} />
                </UI.ListItemAvatar>
                <UI.ListItemText primary={store.Profile[userId]?.username ?? "..."} />
                <UI.ListItemSecondaryAction>
                    <UI.Icons.MoreVert />
                </UI.ListItemSecondaryAction>
            </UI.ListItemButton>

            <UI.Menu
                anchorEl={document.getElementById(anchorId)}
                open={model.openedMenuId.type === 'Some' && model.openedMenuId.value === anchorId}
                onClose={() => dispatch(['ClosedMenu'])}
            >
                {userId === currentUserId ? (
                    <UI.Button
                        size="large"
                        onClick={() => dispatch(['InputUser', { userId: Option.None, }])}
                    >
                        Stop Playing
                    </UI.Button>
                ) : (
                    <UI.MenuItem >
                        <UI.ListItemText
                            primaryTypographyProps={{
                                color: "text.secondary"
                            }}
                            primary="Not action available"
                        />
                    </UI.MenuItem>
                )}

            </UI.Menu>
        </>
    )
}

