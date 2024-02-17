import { testSpaceClientCtx } from "../../../../../@SHARED/testing/client"
import { FlowClientCtx } from "../../../@SHARED/flow-ctx"
import { BuilderClient } from "../builder.client"
import { ModelClient, initClient, initGame } from "../builder.core"

export const initial = {
  model: initClient,
}

const ctx: FlowClientCtx = {
  ...testSpaceClientCtx,
  onQuit() {},
}
const modelGame = initGame({
  ctx,
})

export const clickedPackCreateButton = (model: ModelClient) => {
  return BuilderClient.update({
    model,
    ctx,
    modelGame,
    msg: { t: "pack-create/user-clicked-create-button" },
  })
}
