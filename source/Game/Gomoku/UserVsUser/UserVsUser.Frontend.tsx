import { Cmd, Sub } from "../../../Core";
import { BackendModel, ToFrontend, FrontendMsg, FrontendModel } from "./UserVsUser.Types"

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


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "none": {
            return [model, Cmd.None]
        }
    }
};

export const mergeWithBackend = ({ backendModel }: { frontendModel: FrontendModel, backendModel: BackendModel }): FrontendModel => {
    return backendModel
}

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

export const view = ({ model }: { model: Model }) => {
    return (
        <pre>
            {JSON.stringify(model, null, 2)}
        </pre>
    )
}