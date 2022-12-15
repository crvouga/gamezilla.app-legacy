import { Cmd, Sub } from "../../../Core";
import { BackendModel, BackendMsg, ToBackend } from "./UserVsUser.Types";

//
//
//
// model
//
//
//

export type Model = BackendModel;


export const init: [Model, Cmd<Msg>] = [{}, Cmd.None];

//
//
//
// update
//
//
//

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "none": {
            return [model, Cmd.None]
        }
    }
};


export const updateFromFrontend = (msg: ToBackend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "none": {
            return [model, Cmd.None]
        }
    }
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
    return Sub.None;
};
