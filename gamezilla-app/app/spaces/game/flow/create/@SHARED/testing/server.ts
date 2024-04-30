import { testSpaceServerCtx } from "../../../../@SHARED/testing/server"
import { FlowPackDb } from "../../../@SHARED/flow-pack/flow-pack-db"
import { FlowPuzzleDb } from "../../../@SHARED/flow-puzzle/flow-puzzle-db"
import { FlowServerDeps, initServer } from "../../create.core"
import { initSync } from "../../create.sync"

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
