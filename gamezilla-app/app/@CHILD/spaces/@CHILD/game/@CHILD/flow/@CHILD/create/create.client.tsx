import { GameClientModule } from "gamezilla-app/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { SpaceClientCmd } from "gamezilla-app/app/@CHILD/spaces/@SHARED/space-client-cmd"
import { Eff, Sub } from "gamezilla-app/@SHARED/core"
import { FlowPackListClient } from "../../@SHARED/flow-pack/flow-pack-list"
import { FlowPuzzleListClient } from "../../@SHARED/flow-puzzle/flow-puzzle-list"
import { ClientModule, initClient } from "./create.core"
import { ListTabsClient } from "./list-tabs/list-tabs"
import { PackBuilderClient } from "./pack/builder/pack-builder.client"
import { PackCreateClient } from "./pack/create/pack-create.client"
import { PackListClient } from "./pack/list/pack-list.client"
import { PuzzleBuilderClient } from "./puzzle/builder/puzzle-builder.client"
import { PuzzleCreateClient } from "./puzzle/create/puzzle-create.client"
import { PuzzleDeleteForeverClient } from "./puzzle/delete-forever/puzzle-delete-forever.client"
import { PuzzleEditNameClient } from "./puzzle/edit/puzzle-edit-name.client"
import { PuzzleListClient } from "./puzzle/list/puzzle-list.client"
import { PuzzleSaveChangesClient } from "./puzzle/save-changes/puzzle-save-changes.client"

const update: ClientModule["update"] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    //
    (model) => updateFlowPuzzleList({ ...input, model }),
    (model) => updateFlowPackList({ ...input, model }),
    //
    (model) => ListTabsClient.update({ ...input, model }),
    //
    (model) => PackListClient.update({ ...input, model }),
    (model) => PuzzleBuilderClient.update({ ...input, model }),
    (model) => PuzzleListClient.update({ ...input, model }),
    (model) => PuzzleEditNameClient.update({ ...input, model }),
    (model) => PuzzleDeleteForeverClient.update({ ...input, model }),
    (model) => PuzzleSaveChangesClient.update({ ...input, model }),
    (model) => PuzzleCreateClient.update({ ...input, model }),
    //
    (model) => PackCreateClient.update({ ...input, model }),
    (model) => PackBuilderClient.update({ ...input, model }),
  )
}

const updateFlowPackList: ClientModule["update"] = (input) => {
  const updated = FlowPackListClient.update({
    ctx: input.ctx,
    model: { ...input.model.flowPackList, packs: input.model.packs },
    msg: input.msg?.t === "flow-pack-list" ? input.msg.c : undefined,
    msgServer:
      input.msgServer?.t === "flow-pack-list" ? input.msgServer.c : undefined,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd,
    modelLocation: null,
  })
  return {
    model: {
      ...input.model,
      flowPackList: updated.model,
      packs: updated.model.packs,
    },
    eff: Eff.tag("flow-pack-list", updated.eff),
    msgEvt: [],
    msgSync: [],
    msgCmd: SpaceClientCmd.map(
      updated.msgCmd,
      (c) => ({ t: "flow-pack-list", c }),
      (c) => ({ t: "flow-pack-list", c }),
    ),
  }
}

const updateFlowPuzzleList: ClientModule["update"] = (input) => {
  const updated = FlowPuzzleListClient.update({
    ctx: input.ctx,
    model: { ...input.model.flowPuzzleList, puzzles: input.model.puzzles },
    msg: input.msg?.t === "flow-puzzle-list" ? input.msg.c : undefined,
    msgServer:
      input.msgServer?.t === "flow-puzzle-list" ? input.msgServer.c : undefined,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd,
    modelLocation: null,
  })
  return {
    model: {
      ...input.model,
      flowPuzzleList: updated.model,
      puzzles: updated.model.puzzles,
    },
    eff: Eff.tag("flow-puzzle-list", updated.eff),
    msgEvt: [],
    msgSync: [],
    msgCmd: SpaceClientCmd.map(
      updated.msgCmd,
      (c) => ({ t: "flow-puzzle-list", c }),
      (c) => ({ t: "flow-puzzle-list", c }),
    ),
  }
}

const View: ClientModule["View"] = (input) => {
  const { modelSync } = input

  switch (modelSync.opened.t) {
    case "puzzle-builder": {
      return <PuzzleBuilderClient.View {...input} />
    }

    case "pack-builder": {
      return <PackBuilderClient.View {...input} />
    }

    case "list": {
      return <ListTabsClient.View {...input} />
    }
  }
}

const ViewFeedItem: ClientModule["ViewFeedItem"] = () => {
  return <div></div>
}

const subscriptions: ClientModule["subscriptions"] = (input) => {
  return Sub.batch([
    //
    PuzzleCreateClient.subscriptions(input),
    PackBuilderClient.subscriptions(input),
    Sub.tag(
      "flow-pack-list",
      FlowPackListClient.subscriptions({
        ctx: input.ctx,
        model: input.model.flowPackList,
      }),
    ),
  ])
}

export const CreateClient: ClientModule = {
  init: initClient,
  update,
  subscriptions,
  View,
  ViewFeedItem,
}
