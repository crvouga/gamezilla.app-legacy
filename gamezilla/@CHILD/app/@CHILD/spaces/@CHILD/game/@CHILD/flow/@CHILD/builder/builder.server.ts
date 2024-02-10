import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import { Sub } from "gamezilla/@SHARED/core"
import { FlowPackDb } from "../../@SHARED/flow-pack-db"
import { FlowPuzzleDb } from "../../@SHARED/flow-puzzle-db"
import { ServerModule } from "./builder.core"
import { PackBuilderServer } from "./pack/builder/pack-builder.server"
import { PackCreateServer } from "./pack/create/pack-create.server"
import { PuzzleCreateServer } from "./puzzle/create/puzzle-create.server"
import { PuzzleDeleteForeverServer } from "./puzzle/delete-forever/puzzle-delete-forever.server"
import { PuzzleEditNameServer } from "./puzzle/edit/puzzle-edit-name.server"
import { PuzzleListServer } from "./puzzle/list/puzzle-list.server"
import { PuzzleSaveChangesServer } from "./puzzle/save-changes/puzzle-save-changes.server"

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

const init: ServerModule["init"] = {}

const update: ServerModule["update"] = async (input) => {
  return GameServerModule.chainUpdates(
    { model: input.model },
    (model) => PuzzleListServer.update({ ...input, model }),
    (model) => PuzzleCreateServer.update({ ...input, model }),
    (model) => PuzzleDeleteForeverServer.update({ ...input, model }),
    (model) => PuzzleEditNameServer.update({ ...input, model }),
    (model) => PuzzleSaveChangesServer.update({ ...input, model }),
    //
    (model) => PackCreateServer.update({ ...input, model }),
    (model) => PackBuilderServer.update({ ...input, model }),
  )
}

const subscriptions: ServerModule["subscriptions"] = async () => {
  return Sub.None
}

export const BuilderServer: ServerModule = {
  deps,
  init,
  update,
  subscriptions,
}
