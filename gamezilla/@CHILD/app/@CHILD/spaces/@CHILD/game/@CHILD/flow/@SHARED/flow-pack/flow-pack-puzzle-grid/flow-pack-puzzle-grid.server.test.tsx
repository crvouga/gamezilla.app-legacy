import { describe, expect, it } from "test"
import {
  AuthenticatedClient,
  generateAuthClient,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@TEST/server"
import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server"
import { didSendToClient } from "gamezilla/@CHILD/app/@SHARED/server"
import { FlowPack, FlowPackDb, FlowPackPuzzleGridServer } from ".."
import { testSpaceServerCtx } from "../../../../../@SHARED/testing/server"
import { FlowServerDeps } from "../../../@CHILD/create/create.core"
import { FlowVariant, FlowVariantDimensions } from "../../flow"
import { FlowPuzzle, FlowPuzzleDb } from "../../flow-puzzle"
import { FlowPuzzleId } from "../../flow-puzzle/flow-puzzle-id"
import { ModelServer } from "./flow-pack-puzzle-grid.core"

const initial = () => {
  return {
    model: {},
  }
}

const userObversedGrid =
  (
    deps: FlowServerDeps,
    client: AuthenticatedClient,
    puzzleIds: FlowPuzzleId[],
  ) =>
  (model: ModelServer) => {
    return FlowPackPuzzleGridServer.update({
      ctx: testSpaceServerCtx,
      model,
      deps,
      msgClient: {
        ...client,
        puzzleIds,
        t: "list-puzzles-by-id",
      },
    })
  }

const createDeps = async (
  client: AuthenticatedClient,
): Promise<FlowServerDeps> => {
  const deps: FlowServerDeps = {
    FlowPackDb: FlowPackDb({ t: "hash-map" }),
    FlowPuzzleDb: FlowPuzzleDb({ t: "hash-map" }),
  }

  const puzzle = FlowPuzzle.create({
    createdBy: client.userId,
    count: 1,
    createdAt: testSpaceServerCtx.now,
    flow: FlowVariant.init({
      dimensions: FlowVariantDimensions.init({
        t: "flow-grid",
        height: 5,
        width: 5,
      }),
      terminalsByGroupId: {},
    }),
  })

  const somePack = FlowPack.create({
    createdBy: client.userId,
    now: testSpaceServerCtx.now,
    puzzleIds: [puzzle.id],
  })

  await deps.FlowPuzzleDb.put(puzzle)
  await deps.FlowPackDb.put(somePack)

  return deps
}

describe(import.meta.file, () => {
  it("should send back listed puzzles", async () => {
    const client = generateAuthClient()
    const deps = await createDeps(client)
    const output = await AppServerModule.chainUpdates(
      initial(),
      userObversedGrid(deps, client, []),
    )

    expect(
      didSendToClient(
        output,
        client.clientId,
        (msg) => msg.t === "listed-puzzles-by-id",
      ),
    ).toBeTrue()
  })
})
