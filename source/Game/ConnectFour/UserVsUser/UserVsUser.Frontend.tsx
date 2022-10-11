import { Cmd, Sub } from "../../../Core";
import * as UI from "../../../UI"
import { initShared, FrontendModel, FrontendMsg } from "./UserVsUser.Types"
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

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case "None": {
            return [model, Cmd.None]
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

export const View = ({ model, dispatch, roomComponent, goHome }: { model: Model, dispatch: (msg: Msg) => void, roomComponent: UI.ViewNode, goHome: () => void }) => {
    const homeButton = (
        <UI.IconButton sx={{ marginLeft: -1 }} onClick={goHome}>
            <UI.Icons.Home />
        </UI.IconButton>
    )

    return (
        <UI.FillBox>
            <UI.Header left={homeButton} title="" right={roomComponent} />
        </UI.FillBox>
    )
}