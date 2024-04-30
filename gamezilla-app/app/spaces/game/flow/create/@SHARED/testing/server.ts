import { testSpaceServerCtx } from "../../../../@shared/testing/server"
import { FlowPackDb } from "../../../@shared/flow-pack/flow-pack-db"
import { FlowPuzzleDb } from "../../../@shared/flow-puzzle/flow-puzzle-db"
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
