import { Eff } from "gamezilla/@SHARED/core"
import { ModelServer, MsgServer, MsgToServer } from "./search.core"

type Model = ModelServer

export const init: { model: Model } = {
  model: null,
}

type Msg = MsgServer

export const update = ({
  model,
}: {
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  return { model }
}

export const updateFromClient = ({
  model,
  msg,
}: {
  msg: MsgToServer
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === "search") {
    return { model }
  }
  return { model }
}
