import { Cmd, Sub } from "../../../Core";
import { initShared, BackendModel } from "./UserVsUser.Types";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = ["Noop"]

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case "Noop": {
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
