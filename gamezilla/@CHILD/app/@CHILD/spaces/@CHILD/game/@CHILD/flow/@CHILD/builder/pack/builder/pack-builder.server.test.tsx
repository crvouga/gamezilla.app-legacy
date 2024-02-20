import { describe, expect, it } from "bun:test"
import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import { generateAuthClient } from "gamezilla/@CHILD/app/@CHILD/spaces/@TEST/server"
import { didSendToClient } from "gamezilla/@CHILD/app/@SHARED/server"
import { testSpaceServerCtx } from "../../../../../../@SHARED/testing/server"
import { initial } from "../../@TEST/client"
import { clientListPuzzlesById, getDeps } from "../../@TEST/server"
import { createFlowPuzzle } from "../../@TEST/shared"

describe("pack builder server", () => {
  it("should list puzzles when requested by client", async () => {
    const deps = getDeps()
    const client = generateAuthClient()
    const puzzle = createFlowPuzzle(testSpaceServerCtx.now, client.userId)

    await deps.FlowPuzzleDb.put(puzzle)

    const output = await GameServerModule.chainUpdates(
      initial,
      //
      clientListPuzzlesById(deps, client, [puzzle.id]),
    )

    expect(
      didSendToClient(
        output,
        client.clientId,
        (msg) =>
          msg.t === "pack-builder.list-puzzles-by-id" &&
          msg.listed.t === "ok" &&
          msg.listed.value.some((puzzle) => puzzle.id === puzzle.id),
      ),
    ).toBeTrue()
  })
})
