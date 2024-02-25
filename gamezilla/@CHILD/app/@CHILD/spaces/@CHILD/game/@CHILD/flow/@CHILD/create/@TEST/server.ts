import { AuthenticatedClient } from "gamezilla/@CHILD/app/@CHILD/spaces/@TEST/server"
import { testSpaceServerCtx } from "../../../../../@SHARED/testing/server"
import { FlowPackDb } from "../../../@SHARED/flow-pack/flow-pack-db"
import { FlowPuzzleDb } from "../../../@SHARED/flow-puzzle/flow-puzzle-db"
import { FlowPuzzleId } from "../../../@SHARED/flow-puzzle/flow-puzzle-id"
import {
  FlowServerDeps,
  ModelServer,
  initServer,
  initSync,
} from "../create.core"
import { CreateServer } from "../create.server"

export const initial = {
  model: initServer,
}

export const defaultModelSync = initSync({
  ctx: testSpaceServerCtx,
})

export const getDeps = (): FlowServerDeps => {
  return {
    FlowPackDb: FlowPackDb({ t: "hash-map" }),
    FlowPuzzleDb: FlowPuzzleDb({ t: "hash-map" }),
  }
}

export const clientListPuzzlesById =
  (
    deps: FlowServerDeps,
    client: AuthenticatedClient,
    puzzleIds: FlowPuzzleId[],
  ) =>
  (model: ModelServer) => {
    return CreateServer.update({
      ctx: testSpaceServerCtx,
      model,
      msgClient: { ...client, t: "pack-builder.list-puzzles-by-id", puzzleIds },
      deps,
      modelSync: defaultModelSync,
    })
  }
