import { describe, expect, it } from "bun:test"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { didSendToServer } from "gamezilla/@CHILD/app/@SHARED/client"
import { FlowPack, FlowPackPuzzleGridClient } from ".."
import { testFlowClientCtx } from "../../../@CHILD/create/@TEST/client"
import { FlowPuzzleId } from "../../flow-puzzle/flow-puzzle-id"
import { ModelClient, initClient } from "./flow-pack-puzzle-grid.core"

const initial = (pack: FlowPack) => {
  return {
    model: initClient(pack),
  }
}

const userObversedGrid = () => (model: ModelClient) => {
  return FlowPackPuzzleGridClient.update({
    ctx: testFlowClientCtx,
    model,
    msg: {
      t: "user-observed-grid",
    },
  })
}

const somePack = FlowPack.create({
  createdBy: testFlowClientCtx.currentUserId,
  now: testFlowClientCtx.now,
  puzzleIds: [FlowPuzzleId.generate()],
})

describe(import.meta.file, () => {
  it("should send a request for puzzles when grid is visible", async () => {
    const output = await AppClientModule.chainUpdates(
      initial(somePack),
      userObversedGrid(),
    )

    expect(
      didSendToServer(output, (msg) => msg.t === "user-observed-grid"),
    ).toBeTrue()
  })
})
