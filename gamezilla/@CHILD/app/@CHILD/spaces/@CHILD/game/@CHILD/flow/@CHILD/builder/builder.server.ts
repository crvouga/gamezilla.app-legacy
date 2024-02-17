import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import { Sub } from "gamezilla/@SHARED/core"
import { FlowPackDb } from "../../@SHARED/flow-pack-db"
import { FlowPuzzleDb } from "../../@SHARED/flow-puzzle-db"
import { ServerModule, initServer } from "./builder.core"
import { PackBuilderServer } from "./pack/builder/pack-builder.server"
import { PackCreateServer } from "./pack/create/pack-create.server"
import { PuzzleCreateServer } from "./puzzle/create/puzzle-create.server"
import { PuzzleDeleteForeverServer } from "./puzzle/delete-forever/puzzle-delete-forever.server"
import { PuzzleEditNameServer } from "./puzzle/edit/puzzle-edit-name.server"
import { PuzzleListServer } from "./puzzle/list/puzzle-list.server"
import { PuzzleSaveChangesServer } from "./puzzle/save-changes/puzzle-save-changes.server"
import { FlowPackListServer } from "../../@SHARED/flow-pack-list"
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd"

const deps: ServerModule["deps"] = async (_input) => {
  return {
    FlowPuzzleDb: FlowPuzzleDb({
      t: "hash-map",
    }),
    FlowPackDb: FlowPackDb({
      t: "hash-map",
    }),
  }
}

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates(
    { model: input.model },
    //
    (model) => PuzzleListServer.update({ ...input, model }),
    (model) => PuzzleCreateServer.update({ ...input, model }),
    (model) => PuzzleDeleteForeverServer.update({ ...input, model }),
    (model) => PuzzleEditNameServer.update({ ...input, model }),
    (model) => PuzzleSaveChangesServer.update({ ...input, model }),
    //
    (model) => PackCreateServer.update({ ...input, model }),
    (model) => PackBuilderServer.update({ ...input, model }),
    //
    (model) => updateFlowPackList({ ...input, model }),
  )
}

const updateFlowPackList: ServerModule["update"] = async (input) => {
  const updated = await FlowPackListServer.update({
    ctx: input.ctx,
    model: { ...input.model.flowPackList },
    msg: input.msg?.t === "flow-pack-list" ? input.msg.c : undefined,
    msgClient:
      input.msgClient?.t === "flow-pack-list"
        ? { ...input.msgClient, ...input.msgClient.c }
        : undefined,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd,
    deps: input.deps,
  })
  return {
    model: {
      ...input.model,
      flowPackList: updated.model,
    },
    msgCmd: SpaceServerCmd.tag("flow-pack-list", updated.msgCmd),
    eff: updated.eff,
    msgEvt: updated.msgEvt,
  }
}

const subscriptions: ServerModule["subscriptions"] = async () => {
  return Sub.None
}

export const BuilderServer: ServerModule = {
  deps,
  init: initServer,
  update,
  subscriptions,
}
