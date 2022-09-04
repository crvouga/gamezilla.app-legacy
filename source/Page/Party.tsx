import { Cmd, pipe, tag } from "../Core"
import { UserId } from "../Data"
import * as Party from "../Party/Party.Frontend"
import * as Store from "../Store"
import * as UI from "../UI"

//
//
//
// Model
//
//
//

export type Model = {

}

export const init: [Model, Cmd.Cmd<Msg>] = [{}, Cmd.None]

//
//
//
// Update
//
//
//

export type Msg = ["Party", Party.Msg]

type OutAction = Party.Action

export const update = (
    { currentUserId }: { currentUserId: UserId.UserId },
    msg: Msg,
    model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
    switch (msg[0]) {
        case "Party": {
            return [model, Cmd.None, [["Party", ["Msg", msg[1]]]]]
        }
    }
}

//
//
//
// View
//
//
//

export const view = (
    {
        currentUserId,
        party,
        store,
    }: {
        party: Party.Model
        currentUserId: UserId.UserId
        store: Store.Model
    },
    model: Model,
): UI.View<Msg> => {
    return pipe(
        Party.view({ currentUserId, store }, party),
        UI.map(tag("Party")),
    )
}
