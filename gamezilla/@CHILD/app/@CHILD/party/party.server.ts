import { Eff, exhaustive, isErr } from "gamezilla/@SHARED/core"
import { Res, ModelServer, MsgServer, MsgToServer, handle } from "./party.core"

//
//
//
// Model
//
//
//

export type Model = ModelServer

export const init: Model = {
  parties: {},
  users: {},
}

//
//
//
// Update
//
//
//

export type Msg = MsgServer

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "none": {
      return [model, Eff.None]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromClient = (
  msg: MsgToServer,
  model: Model,
): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "PartyCreate":
    case "PartyDestroy":
    case "PartyJoin":
    case "party-get":
    case "PartyLeave": {
      const res: Res = [...msg, handle(msg, model)]
      if (isErr(res[2])) {
        return [model, Eff.None]
      }
      return [res[2].value, Eff.None]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}
