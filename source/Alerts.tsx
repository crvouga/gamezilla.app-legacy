import { Cmd, Sub } from "./Core";

//
//
//
// Model
//
//
//

export type Model = {
    snacks: Snack[]
    conformationModal: ConformationModal | "None"
};

type ConformationModal = {
    title: string,
}

type Snack = {
    variant: "Error" | "Info",
    message: string
}

export const init: Model = {
    conformationModal: "None",
    snacks: []
}

//
//
//
// Update
//
//
//

export type Msg = ["Noop"]

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
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

export const subscriptions = (_model: Model): Sub<Msg> => {
    return Sub.None;
};
