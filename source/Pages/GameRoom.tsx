import * as UI from "../UI";
import { Cmd, Sub } from "../Core";
import * as Games from "../Games"

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
    return [model, Cmd.None];
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

export const view =
    ({ games }: { games: Games.FrontendModel }, model: Model): UI.View<Msg> =>
        (dispatch) => {
            return (
                <UI.FillBox>
                    <UI.Toolbar>
                        <UI.Button sx={{ marginLeft: -1 }}>
                            Leave
                        </UI.Button>
                        <UI.Box sx={{ flex: 1 }}>

                        </UI.Box>
                    </UI.Toolbar>

                </UI.FillBox>
            );
        };
