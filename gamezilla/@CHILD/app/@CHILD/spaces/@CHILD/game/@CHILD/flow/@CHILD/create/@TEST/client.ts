import { EventId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { ok } from "gamezilla/@SHARED/core"
import { LamportTimestamp } from "gamezilla/@SHARED/lamport-clock"
import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"
import { Flow } from "../../../@SHARED/flow"
import { FlowClientCtx } from "../../../@SHARED/flow-ctx"
import { FlowPack } from "../../../@SHARED/flow-pack/flow-pack"
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "../../../@SHARED/flow-puzzle/flow-puzzle-id"
import { samples } from "../../../@SHARED/flow/flow-variant-grid/flow-grid-samples"
import { CreateClient } from "../create.client"
import { ModelClient, ModelSync, initClient, initSync } from "../create.core"

export const initial = {
  model: initClient,
}

export const testFlowClientCtx: FlowClientCtx = {
  ...testSpaceClientCtx,
  onQuit() {},
}

export const defaultModelSync = initSync({
  ctx: testFlowClientCtx,
})

const ctx = testFlowClientCtx

export const clickedPackCreateButton = (model: ModelClient) => {
  return CreateClient.update({
    model,
    ctx: testFlowClientCtx,
    modelSync: defaultModelSync,
    msg: { t: "pack-create.clicked-create-button" },
  })
}

export const userCreatedPack = (pack: FlowPack) => (model: ModelClient) => {
  return CreateClient.update({
    model,
    ctx: testFlowClientCtx,
    modelSync: defaultModelSync,
    msgSync: {
      t: "user-created-pack",
      created: ok(pack),
      eventId: EventId.generate(),
      happenedAt: LamportTimestamp.fromNumber(0),
      userId: testFlowClientCtx.currentUserId,
    },
  })
}

export const clickedPackItem = (pack: FlowPack) => (model: ModelClient) => {
  return CreateClient.update({
    model,
    ctx: testFlowClientCtx,
    modelSync: defaultModelSync,
    msg: { t: "pack-list.clicked-pack-item", pack },
  })
}

export const clickedOpenPuzzlePickerButton =
  (modelSync: ModelSync = defaultModelSync) =>
  (model: ModelClient) => {
    return CreateClient.update({
      model,
      msg: {
        t: "pack-builder.user-clicked-open-add-puzzle-button",
        userId: ctx.currentUserId,
      },
      ctx,
      modelSync,
    })
  }

export const closedPuzzlePickerDrawer = (model: ModelClient) => {
  return CreateClient.update({
    model,
    msg: { t: "pack-builder.user-closed-add-puzzle" },
    ctx,
    modelSync: defaultModelSync,
  })
}

export const clickedPuzzleListItem =
  (puzzle: FlowPuzzle) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      msg: {
        t: "puzzle-list.clicked-puzzle-list-item",
        puzzle,
      },
      ctx,
      modelSync: defaultModelSync,
    })
  }

export const clickedExitPuzzleBuilderButton =
  (modelSync: ModelSync = defaultModelSync) =>
  (model: ModelClient) => {
    return CreateClient.update({
      model,
      msg: { t: "puzzle-builder.user-clicked-exit-button" },
      ctx,
      modelSync: modelSync,
    })
  }

export const serverListedPuzzlesOk =
  (puzzles: FlowPuzzle[]) => (model: ModelClient) => {
    return CreateClient.update({
      ctx: testFlowClientCtx,
      model,
      modelSync: defaultModelSync,
      msgServer: {
        t: "flow-puzzle-list",
        c: {
          t: "flow-puzzle-list.listed-puzzle",
          listed: ok({
            items: puzzles,
            limit: 10,
            offset: 0,
            total: puzzles.length,
          }),
        },
      },
    })
  }

export const puzzleBuilderPressDownRandomNode =
  (modelSync: ModelSync) => (model: ModelClient) => {
    const puzzleBuilder = modelSync.puzzleBuilder

    if (!puzzleBuilder) {
      return { model }
    }

    const nodes = Object.values(Flow.toNodes(puzzleBuilder.puzzle.flow))

    const randomNode = nodes[Math.floor(Math.random() * nodes.length)]

    if (!randomNode) {
      return { model }
    }

    return CreateClient.update({
      model,
      msg: {
        t: "puzzle-builder.flow-ui-edit",
        c: { t: "pressed-down-node", nodeId: randomNode.nodeId },
      },
      ctx,
      modelSync: defaultModelSync,
    })
  }

export const puzzleBuilderUserSavedChanges =
  (puzzle: FlowPuzzle) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      msgSync: {
        t: "puzzle-builder.saved-puzzle",
        eventId: EventId.generate(),
        happenedAt: LamportTimestamp.fromNumber(0),
        saved: ok(puzzle),
        userId: ctx.currentUserId,
      },
      ctx,
      modelSync: defaultModelSync,
    })
  }

export const clickedPuzzlePickerItem =
  (puzzle: FlowPuzzle) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      msg: {
        t: "pack-builder.user-clicked-add-puzzle-item",
        puzzle,
        userId: ctx.currentUserId,
      },
      ctx,
      modelSync: defaultModelSync,
    })
  }

export const clickedExitPuzzleButton = () => (model: ModelClient) => {
  return CreateClient.update({
    model,
    msg: {
      t: "pack-builder.user-clicked-exit-puzzle-button",
      userId: ctx.currentUserId,
    },
    ctx,
    modelSync: defaultModelSync,
  })
}

export const clickedPuzzleGridItem =
  (puzzle: FlowPuzzle, index: number) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      msg: { t: "pack-builder.user-clicked-pack-item", puzzle, index },
      ctx,
      modelSync: defaultModelSync,
    })
  }

export const serverCreatedPack = (pack: FlowPack) => (model: ModelClient) => {
  return CreateClient.update({
    model,
    ctx: testFlowClientCtx,
    modelSync: defaultModelSync,
    msgServer: {
      t: "pack-create.created-pack",
      created: ok(pack),
    },
  })
}

export const createFlowPuzzle = (ctx: SpaceClientCtx) => {
  return FlowPuzzle.create({
    count: 1,
    createdAt: ctx.now,
    createdBy: ctx.currentUserId,
    flow: samples["5x5"]["1"],
  })
}

export const createFlowPack = (
  ctx: SpaceClientCtx,
  puzzleIds: FlowPuzzleId[] = [],
) => {
  return FlowPack.create({
    now: ctx.now,
    puzzleIds,
    count: 1,
    createdBy: ctx.currentUserId,
  })
}

export const serverListedPuzzlesByIdOk =
  (puzzles: FlowPuzzle[]) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      ctx: testFlowClientCtx,
      modelSync: defaultModelSync,
      msgServer: {
        t: "pack-builder.list-puzzles-by-id",
        listed: ok(puzzles),
      },
    })
  }
