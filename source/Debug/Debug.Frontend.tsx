import { Cmd, Sub } from "../Core";
import * as UI from "../UI"
import { ToFrontend, FrontendModel, FrontendMsg, ToBackend } from "./Debug.Types"
import * as Route from "../Route"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: Model = {
    snapshots: []
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {

        case 'ClickedBack': {
            return [model, Route.back]
        }

        case "GoBack": {
            return [model, Cmd.None]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'GoBack_Done': {
            const modelNew = msg[1]
            return [modelNew, Cmd.None]
        }

        case 'Sync': {
            const modelNew = msg[1]
            return [modelNew, Cmd.None]
        }
    }
}

export type Action = ['Debug', ['Msg', Msg]]

export const runAction = (msg: Action, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[1][0]) {
        case 'Msg': {
            return update(msg[1][1], model)
        }
    }
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

export const View = ({ model, dispatch }: { model: Model, dispatch: (msg: Msg) => void }) => {
    return <UI.FillBox>
        <UI.Header
            left={<UI.HeaderBackButton onClick={() => dispatch(['ClickedBack'])} />}
            title="Debug"
        />

        {model.snapshots.length === 0 && (
            <UI.Typography color="text.secondary" sx={{ paddingX: 2 }}>
                No snapshots
            </UI.Typography>
        )}

        <UI.List sx={{ overflowY: "scroll", flex: 1 }}>
            {model.snapshots.map((snapshot, index) => (
                <UI.ListItemButton key={index}>
                    <UI.ListItemText primaryTypographyProps={{ noWrap: true }} primary={snapshot.msgType} />
                </UI.ListItemButton>
            ))}
        </UI.List>
    </UI.FillBox>
}