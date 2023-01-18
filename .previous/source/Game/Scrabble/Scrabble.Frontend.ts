import { Cmd, Sub } from "../../Core";

//
//
//
// Model
//
//
//

export type Model = {};

export const init: Model = {}

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

// 
// 
// 
// View
// 
// 
// 

export const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
}
