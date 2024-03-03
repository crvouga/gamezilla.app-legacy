import { GameServerModule } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import {
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { Sub } from "gamezilla-app/@SHARED/core"
import { SpaceServerCmd } from "../../../../@SHARED/space-server-cmd"
import { CreateServer } from "./@CHILD/create/create.server"
import { PlayServer } from "./@CHILD/play/play.server"
import {
  MsgSync,
  ModelSync,
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "./flow.core"

type Module = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgSync: MsgSync
  ModelSync: ModelSync
  Ctx: SpaceServerCtx
  MsgInCmd: null
  MsgInEvent: SpaceServerEvent
  MsgOutCmd: SpaceServerCmd<MsgToClient>
  MsgOutEvent: null
  Deps: null
}>

const init: Module["init"] = {
  t: "none",
}

const update: Module["update"] = async (input) => {
  return GameServerModule.andThen({ model: input.model }, (model) =>
    updateChild({ ...input, model }),
  )
}

const updateChild: Module["update"] = async (input) => {
  const { modelSync } = input

  switch (modelSync.t) {
    case "play": {
      const updated = await PlayServer.update({
        ctx: input.ctx,
        modelSync: modelSync.c,
        model: input.model.t === "play" ? input.model.c : PlayServer.init,
        msgCmd: input.msgCmd,
        msgEvt: input.msgEvt,
        msgClient:
          input.msgClient?.t === "play"
            ? { ...input.msgClient, ...input.msgClient.c }
            : null,
        msgSync:
          input.msgSync?.t === "play"
            ? { ...input.msgSync, ...input.msgSync.c }
            : null,
        msg: input.msg?.t === "play" ? input.msg.c : null,
        deps: null,
      })

      const tagged = GameServerModule.tagOutput(
        "play",
        (msgCmd) => SpaceServerCmd.tag("play", msgCmd),
        updated,
      )

      return tagged
    }

    case "create": {
      const updated = await CreateServer.update({
        ctx: input.ctx,
        modelSync: modelSync.c,
        model: input.model.t === "create" ? input.model.c : CreateServer.init,
        msgCmd: input.msgCmd,
        msgEvt: input.msgEvt,
        msgClient:
          input.msgClient?.t === "create"
            ? { ...input.msgClient, ...input.msgClient.c }
            : null,
        msgSync:
          input.msgSync?.t === "create"
            ? { ...input.msgSync, ...input.msgSync.c }
            : null,
        msg: input.msg?.t === "create" ? input.msg.c : null,
        deps: await CreateServer.deps({
          ctx: input.ctx,
        }),
      })

      const tagged = GameServerModule.tagOutput(
        "create",
        (msgCmd) => SpaceServerCmd.tag("create", msgCmd),
        updated,
      )

      return tagged
    }

    case null: {
      return { model: input.model }
    }
  }
}

const subscriptions: Module["subscriptions"] = async (input) => {
  const { modelSync } = input

  switch (modelSync.t) {
    case "play": {
      return Sub.tag(
        "play",
        await PlayServer.subscriptions({
          ctx: input.ctx,
          modelSync: modelSync.c,
          model: input.model.t === "play" ? input.model.c : PlayServer.init,
        }),
      )
    }

    case "create": {
      return Sub.tag(
        "create",
        await CreateServer.subscriptions({
          ctx: input.ctx,
          modelSync: modelSync.c,
          model: input.model.t === "create" ? input.model.c : CreateServer.init,
        }),
      )
    }

    case null: {
      return Sub.None
    }
  }
}

export const FlowServer: Module = {
  init,
  subscriptions,
  update,
  async deps() {
    return null
  },
}
