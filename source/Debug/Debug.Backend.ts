import { Cmd, Sub } from "../Core";
import { BackendModel, ToFrontend, ToBackend, BackendMsg } from "./Debug.Types"

//
//
//
// Model
//
//
//

export type Model = BackendModel

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

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case "Noop": {
            return [model, Cmd.None]
        }
    }
};

export const updateFromFrontend = (msg: ToBackend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'GoBack': {
            return [model, Cmd.None]
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
