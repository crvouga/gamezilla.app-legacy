import { Audio, Cmd, exhaustive, Option, Sub, tag } from "../../../Core"
import { UserId } from "../../../Data"
import * as Store from "../../../Store"
import * as UI from "../../../UI"
import {
    BackendModel,
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
    model: Model,
): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {

        case 'Audio_Done': {
            return [model, Cmd.None]
        }

        case 'OpenedMenu': {
            return [model, Cmd.None]
        }

        default:
            return exhaustive(msg[0])
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
        }: {
            store: Store.Model
            currentUserId: UserId.UserId
            model: Model,
            dispatch: (msg: Msg) => void
            onBack: () => void
        },

    ) => {
        // const { boardWidth, ref } = useBoardWidth([model.sharedModel.type])

        if (model.sharedModel.type === 'Setup') {
            return (
                <UI.FillBox>
                    <UI.Box sx={{ paddingX: 2, marginBottom: 2 }}>
                        <UI.Button onClick={onBack} variant="contained" startIcon={<UI.Icons.ChevronLeft />} >
                            Back
                        </UI.Button>
                    </UI.Box>

                    set up game

                </UI.FillBox >
            )
        }

        return <UI.FillBox>
            game time
        </UI.FillBox>

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