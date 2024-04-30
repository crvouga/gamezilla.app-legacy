import { EventId } from "gamezilla-app/app/spaces/@SHARED/event"
import { SpaceClientCtx } from "gamezilla-app/app/spaces/@SHARED/space"
import { Ok } from "gamezilla-app/@SHARED/core"
import { LamportTimestamp } from "gamezilla-app/@SHARED/lamport-clock"
import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"
import { Flow } from "../../../../@SHARED/flow"
import { FlowClientCtx } from "../../../../@SHARED/flow-ctx"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "../../../../@SHARED/flow-puzzle/flow-puzzle-id"
import { samples } from "../../../../@SHARED/flow/flow-variant/flow-grid/flow-grid-samples"
import { CreateClient } from "../../create.client"
import { ModelClient, ModelSync, initClient } from "../../create.core"
import { initSync } from "../../create.sync"

export const initial = {
  model: initClient,
}

export const testFlowClientCtx = async (): Promise<FlowClientCtx> => {
  return {
    ...(await testSpaceClientCtx()),
    onQuit() {},
  }
}

export const clickedPackCreateButton =
  (ctx: FlowClientCtx) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      ctx: ctx,
      modelSync: initSync({ ctx }),
      msg: { t: "pack-create.clicked-create-button" },
    })
  }

export const userCreatedPack =
  (ctx: FlowClientCtx, pack: FlowPack) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      ctx: ctx,
      modelSync: initSync({ ctx }),
      msgSync: {
        t: "user-created-pack",
        created: Ok(pack),
        eventId: EventId.generate(),
        happenedAt: LamportTimestamp.fromNumber(0),
        userId: ctx.currentUserId,
      },
    })
  }

export const clickedPackItem =
  (ctx: FlowClientCtx, pack: FlowPack) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      ctx: ctx,
      modelSync: initSync({ ctx }),
      msg: { t: "pack-list.clicked-pack-item", pack },
    })
  }

export const clickedOpenPuzzlePickerButton =
  (ctx: FlowClientCtx, modelSync: ModelSync = initSync({ ctx })) =>
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

export const closedPuzzlePickerDrawer =
  (ctx: FlowClientCtx) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      msg: { t: "pack-builder.user-closed-add-puzzle" },
      ctx,
      modelSync: initSync({ ctx }),
    })
  }

export const clickedPuzzleListItem =
  (ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      msg: {
        t: "puzzle-list.clicked-puzzle-list-item",
        puzzle,
      },
      ctx,
      modelSync: initSync({ ctx }),
    })
  }

export const clickedExitPuzzleBuilderButton =
  (ctx: FlowClientCtx, modelSync: ModelSync = initSync({ ctx })) =>
  (model: ModelClient) => {
    return CreateClient.update({
      model,
      msg: { t: "puzzle-builder.user-clicked-exit-button" },
      ctx,
      modelSync: modelSync,
    })
  }

export const serverListedPuzzlesOk =
  (ctx: FlowClientCtx, puzzles: FlowPuzzle[]) => (model: ModelClient) => {
    return CreateClient.update({
      ctx: ctx,
      model,
      modelSync: initSync({ ctx }),
      msgServer: {
        t: "flow-puzzle-list",
        c: {
          t: "flow-puzzle-list.listed-puzzle",
          listed: Ok({
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
  (ctx: FlowClientCtx, modelSync: ModelSync) => (model: ModelClient) => {
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
      modelSync: initSync({ ctx }),
    })
  }

export const puzzleBuilderUserSavedChanges =
  (ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      msgSync: {
        t: "puzzle-builder.saved-puzzle",
        eventId: EventId.generate(),
        happenedAt: LamportTimestamp.fromNumber(0),
        saved: Ok(puzzle),
        userId: ctx.currentUserId,
      },
      ctx,
      modelSync: initSync({ ctx }),
    })
  }

export const clickedPuzzlePickerItem =
  (ctx: FlowClientCtx, puzzle: FlowPuzzle) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      msg: {
        t: "pack-builder.user-clicked-add-puzzle-item",
        puzzle,
        userId: ctx.currentUserId,
      },
      ctx,
      modelSync: initSync({ ctx }),
    })
  }

export const clickedExitPuzzleButton =
  (ctx: FlowClientCtx) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      msg: {
        t: "pack-builder.user-clicked-exit-puzzle-button",
        userId: ctx.currentUserId,
      },
      ctx,
      modelSync: initSync({ ctx }),
    })
  }

export const clickedPuzzleGridItem =
  (ctx: FlowClientCtx, puzzle: FlowPuzzle, index: number) =>
  (model: ModelClient) => {
    return CreateClient.update({
      model,
      msg: { t: "pack-builder.user-clicked-pack-item", puzzle, index },
      ctx,
      modelSync: initSync({ ctx }),
    })
  }

export const serverCreatedPack =
  (ctx: FlowClientCtx, pack: FlowPack) => (model: ModelClient) => {
    return CreateClient.update({
      model,
      ctx: ctx,
      modelSync: initSync({ ctx }),
      msgServer: {
        t: "pack-create.created-pack",
        created: Ok(pack),
      },
    })
  }

export function createFlowPuzzle(ctx: SpaceClientCtx) {
  return FlowPuzzle.create({
    count: 1,
    createdAt: ctx.now,
    createdBy: ctx.currentUserId,
    flow: samples["5x5"]["1"],
  })
}

export function createFlowPack(
  ctx: SpaceClientCtx,
  puzzleIds: FlowPuzzleId[] = [],
) {
  return FlowPack.create({
    now: ctx.now,
    puzzleIds,
    count: 1,
    createdBy: ctx.currentUserId,
  })
}
