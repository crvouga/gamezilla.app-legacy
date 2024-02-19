import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { SpaceClientCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-client-cmd"
import {
  Avatar,
  Button,
  IconArrowLeftOnRect,
  Tabs,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { Eff, Sub } from "gamezilla/@SHARED/core"
import { ViewSpaceHostChip } from "../../../../@SHARED/game"
import { FlowPuzzleListClient } from "../../@SHARED/flow-puzzle-list"
import { ClientModule, initClient } from "./builder.core"
import { PackBuilderClient } from "./pack/builder/pack-builder.client"
import { PackCreateClient } from "./pack/create/pack-create.client"
import { PackListClient } from "./pack/list/pack-list.client"
import { PuzzleBuilderClient } from "./puzzle/builder/puzzle-builder.client"
import { PuzzleCreateClient } from "./puzzle/create/puzzle-create.client"
import { PuzzleDeleteForeverClient } from "./puzzle/delete-forever/puzzle-delete-forever.client"
import { PuzzleEditNameClient } from "./puzzle/edit/puzzle-edit-name.client"
import { PuzzleListClient } from "./puzzle/list/puzzle-list.client"
import { PuzzleSaveChangesClient } from "./puzzle/save-changes/puzzle-save-changes.client"
import { FlowPackListClient } from "../../@SHARED/flow-pack-list"

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    //
    (model) => updateLocation({ ...input, model }),
    //
    (model) => updateFlowPuzzleList({ ...input, model }),
    (model) => updateFlowPackList({ ...input, model }),
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

const updateFlowPackList: ClientModule["update"] = async (input) => {
  const updated = await FlowPackListClient.update({
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

const updateFlowPuzzleList: ClientModule["update"] = async (input) => {
  const updated = await FlowPuzzleListClient.update({
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

const updateLocation: ClientModule["update"] = (input) => {
  const { model, msg } = input

  switch (msg?.t) {
    case "user-changed-list-tab": {
      return {
        model: { ...model },
        msgSync: [
          withId({
            t: "user-changed-list-tab",
            listTab: msg.listTab,
          }),
        ],
      }
    }

    default: {
      return { model }
    }
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
      return <ViewList {...input} />
    }
  }
}

const ViewList: ClientModule["View"] = (input) => {
  const { ctx, modelSync, dispatch } = input

  const isSpectating = ctx.space.hostId !== ctx.currentUserId

  if (isSpectating) {
    const host = ctx.profiles[ctx.space.hostId]
    const name = host?.username ?? "Host"
    return (
      <div className="h-ull flex w-full flex-1 flex-col items-center justify-center gap-4">
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <Avatar src={host?.avatarUrl} className="h-20 w-20" />
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold">{name}</p>
            <ViewSpaceHostChip />
          </div>
        </div>
        <p className="text-lg font-bold text-secondary">
          Choosing a puzzle to build
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <Tabs
        tabs={["puzzles", "packs"]}
        labels={{
          packs: "Packs",
          puzzles: "Puzzles",
        }}
        onSelect={(listTab) =>
          dispatch({ t: "user-changed-list-tab", listTab })
        }
        selected={modelSync.listTab}
      />

      {modelSync.listTab === "puzzles" && <PuzzleListClient.View {...input} />}

      {modelSync.listTab === "packs" && <PackListClient.View {...input} />}

      <div className="flex w-full items-center gap-4 border-t border-neutral-700 p-4">
        <Button
          onClick={input.ctx.onQuit}
          className="flex-1"
          text="Exit"
          start={<IconArrowLeftOnRect className="h-6 w-6" />}
          variant="contained"
          color="default"
        />
      </div>
    </div>
  )
}

const ViewFeedItem: ClientModule["ViewFeedItem"] = () => {
  return <div></div>
}

const subscriptions: ClientModule["subscriptions"] = async (input) => {
  return Sub.batch([
    //
    await PuzzleCreateClient.subscriptions(input),
    Sub.tag(
      "flow-pack-list",
      await FlowPackListClient.subscriptions({
        ctx: input.ctx,
        model: input.model.flowPackList,
      }),
    ),
  ])
}

export const BuilderClient: ClientModule = {
  init: initClient,
  update,
  subscriptions,
  View,
  ViewFeedItem,
}
