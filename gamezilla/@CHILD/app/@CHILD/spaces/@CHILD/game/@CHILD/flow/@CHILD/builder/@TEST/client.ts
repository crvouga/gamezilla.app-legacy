import { EventId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { ok } from "gamezilla/@SHARED/core"
import { LamportTimestamp } from "gamezilla/@SHARED/lamport-clock"
import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"
import { FlowClientCtx } from "../../../@SHARED/flow-ctx"
import { FlowPack } from "../../../@SHARED/flow-pack/flow-pack"
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle"
import { samples } from "../../../@SHARED/flow/flow-grid/flow-grid-samples"
import { BuilderClient } from "../builder.client"
import { ModelClient, initClient, initGame } from "../builder.core"

export const initial = {
  model: initClient,
}

export const testFlowClientCtx: FlowClientCtx = {
  ...testSpaceClientCtx,
  onQuit() {},
}

export const modelGame = initGame({
  ctx: testFlowClientCtx,
})

const ctx = testFlowClientCtx

export const clickedPackCreateButton = (model: ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: testFlowClientCtx,
    modelGame,
    msg: { t: "pack-create.clicked-create-button" },
  })
}

export const userCreatedPack = (pack: FlowPack) => (model: ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: testFlowClientCtx,
    modelGame,
    msgGame: {
      t: "user-created-pack",
      created: ok(pack),
      eventId: EventId.generate(),
      happenedAt: LamportTimestamp.fromNumber(0),
      userId: testFlowClientCtx.currentUserId,
    },
  })
}

export const clickedPackItem = (pack: FlowPack) => (model: ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: testFlowClientCtx,
    modelGame,
    msg: { t: "pack-list.clicked-pack-item", pack },
  })
}

export const clickedOpenPuzzlePickerButton = (model: ModelClient) => {
  return BuilderClient.update({
    model,
    msg: {
      t: "pack-builder.user-clicked-open-add-puzzle-button",
      userId: ctx.currentUserId,
    },
    ctx,
    modelGame,
  })
}

export const closedPuzzlePickerDrawer = (model: ModelClient) => {
  return BuilderClient.update({
    model,
    msg: { t: "pack-builder.user-closed-add-puzzle" },
    ctx,
    modelGame,
  })
}

export const clickedPuzzlePickerItem =
  (puzzle: FlowPuzzle) => (model: ModelClient) => {
    return BuilderClient.update({
      model,
      msg: {
        t: "pack-builder.user-clicked-add-puzzle-item",
        puzzle,
        userId: ctx.currentUserId,
      },
      ctx,
      modelGame,
    })
  }

export const clickedExitPuzzleButton = () => (model: ModelClient) => {
  return BuilderClient.update({
    model,
    msg: {
      t: "pack-builder.user-clicked-exit-puzzle-button",
      userId: ctx.currentUserId,
    },
    ctx,
    modelGame,
  })
}

export const clickedPuzzleGridItem =
  (puzzle: FlowPuzzle, index: number) => (model: ModelClient) => {
    return BuilderClient.update({
      model,
      msg: { t: "pack-builder.user-clicked-pack-item", puzzle, index },
      ctx,
      modelGame,
    })
  }

export const serverCreatedPack = (pack: FlowPack) => (model: ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: testFlowClientCtx,
    modelGame,
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
    puzzle: {
      t: "grid",
      c: samples["5x5"]["1"],
    },
  })
}

export const createFlowPack = (ctx: SpaceClientCtx) => {
  return FlowPack.create({
    now: ctx.now,
    puzzleIds: [],
    count: 1,
    createdBy: ctx.currentUserId,
  })
}
