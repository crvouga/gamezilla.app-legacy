import { Eff } from "gamezilla/@SHARED/core"
import { ModelServer, MsgServer, MsgToServer } from "./chat.core"

export const init: { model: ModelServer } = { model: null }

export const updateFromClient = ({
    model,
}: {
    msg: MsgToServer
    model: ModelServer
}): {
    model: ModelServer
    eff?: Eff<MsgServer>
} => {
    return { model }
}

export const update = ({
    model,
}: {
    msg: MsgServer
    model: ModelServer
}): {
    model: ModelServer
    eff?: Eff<MsgServer>
} => {
    return { model }
}
