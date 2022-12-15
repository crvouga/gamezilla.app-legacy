import { Cmd, Sub } from "../../Core";
import { ToFrontend, FrontendMsg, FrontendModel } from "./Gomoku.Types"

//
//
//
// model
//
//
//

export type Model = FrontendModel;


export const init: [Model, Cmd<Msg>] = [{}, Cmd.None];

//
//
//
// update
//
//
//

export type Msg = FrontendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "none": {
            return [model, Cmd.None]
        }
    }
};


export const update_from_backend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
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

// 
// 
// 
// view
// 
// 
// 

export const view = (model: Model) => {
    return (
        <pre>
            {JSON.stringify(model, null, 2)}
        </pre>
    )
}