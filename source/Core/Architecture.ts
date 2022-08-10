import * as  Cmd  from "./Cmd"
import * as  Sub  from "./Sub"

// 
// 
// 
// Update
// 
// 
// 

export type UpdateInput<Msg, Model> = {
    msg: Msg;
    model: Model;
}

export type UpdateOutput<Msg, Model> = {
    model: Model;
    cmd: Cmd.Cmd<Msg>
}

export type Update = <Msg, Model>(input: UpdateInput<Msg,Model>) => UpdateOutput<Msg,Model>

// 
// 
//  
// Subscriptions
// 
// 
// 

export type Subscriptions = <Msg, Model>(model: Model) => Sub.Sub<Msg>