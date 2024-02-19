import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"
import { FlowClientCtx } from "../../../@SHARED/flow-ctx"
import { FlowPack } from "../../../@SHARED/flow-pack/flow-pack"
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle"
import { BuilderClient } from "../builder.client"
import { ModelClient, initClient, initGame } from "../builder.core"
import { FlowGrid } from "../../../@SHARED/flow"
import { ok } from "gamezilla/@SHARED/core"
import { EventId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { LamportTimestamp } from "gamezilla/@SHARED/lamport-clock"

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
    msg: { t: "pack-builder.user-clicked-open-puzzle-picker-button" },
    ctx,
    modelGame,
  })
}

export const closedPuzzlePickerDrawer = (model: ModelClient) => {
  return BuilderClient.update({
    model,
    msg: { t: "pack-builder.user-closed-puzzle-picker" },
    ctx,
    modelGame,
  })
}

export const clickedPuzzlePickerItem =
  (puzzle: FlowPuzzle) => (model: ModelClient) => {
    return BuilderClient.update({
      model,
      msg: { t: "pack-builder.user-clicked-puzzle-picker-item", puzzle },
      ctx,
      modelGame,
    })
  }

export const clickedPuzzleGridItem =
  (index: number) => (model: ModelClient) => {
    return BuilderClient.update({
      model,
      msg: { t: "pack-builder.user-clicked-puzzle-grid-item", index },
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
      c: FlowGrid.init({ height: 5, width: 5 }),
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
