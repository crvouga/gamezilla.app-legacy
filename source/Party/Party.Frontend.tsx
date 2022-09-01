import { Cmd, Sub } from "../Core";
import { FrontendModel, FrontendMsg, ToBackend, ToFrontend } from "./Party.Types";
import * as UI from "../UI"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: [Model, Cmd.Cmd<Msg>] = [{ type: "Init" }, Cmd.None];

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
        case "CreateParty": {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'CreatePartyResulted': {
            return [model, Cmd.None]
        }
    }
}


export type Action = ['Party', ['Msg', Msg]]

export const runAction = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, action: Action, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (action[1][0]) {
        case 'Msg': {
            return update({ sendToBackend }, action[1][1], model)
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

export const view = (model: Model): UI.View<Msg> => (dispatch) => {
    return <>
        party
        <pre>
            {JSON.stringify(model, null, 4)}
        </pre>
    </>
}