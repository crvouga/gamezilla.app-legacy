import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"
import { FlowClientCtx } from "../../../@SHARED/flow-ctx"
import { FlowPack } from "../../../@SHARED/flow-pack/flow-pack"
import { BuilderClient } from "../builder.client"
import { ModelClient, initClient, initGame } from "../builder.core"

export const initial = {
  model: initClient,
}

export const testFlowClientCtx: FlowClientCtx = {
  ...testSpaceClientCtx,
  onQuit() {},
}

const modelGame = initGame({
  ctx: testFlowClientCtx,
})

export const clickedPackCreateButton = (model: ModelClient) => {
  return BuilderClient.update({
    model,
    ctx: testFlowClientCtx,
    modelGame,
    msg: { t: "pack-create.clicked-create-button" },
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
