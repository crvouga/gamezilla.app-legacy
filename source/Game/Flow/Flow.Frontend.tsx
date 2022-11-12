import { Cmd, Sub } from "../../Core";

//
//
//
// Model
//
//
//

export type Model = {};

export const init: [Model, Cmd.Cmd<Msg>] = [{}, Cmd.None];

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

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
    return Sub.None;
};
