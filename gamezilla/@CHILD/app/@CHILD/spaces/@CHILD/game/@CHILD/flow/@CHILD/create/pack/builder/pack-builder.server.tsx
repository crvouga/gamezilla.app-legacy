import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd"
import { Eff } from "gamezilla/@SHARED/core"
import { FlowPackPuzzleGridServer } from "../../../../@SHARED/flow-pack"
import { ServerModule } from "../../create.core"

const SavePack: Pick<ServerModule, "update"> = {
  async update(input) {
    const { deps, model, modelSync, msgSync } = input
    switch (msgSync?.t) {
      case "pack-builder.user-clicked-add-puzzle-item": {
        if (!modelSync.packBuilder) {
          return { model }
        }

        const saved = await deps.FlowPackDb.put(modelSync.packBuilder.pack)

        return {
          model,
          msgSync: [withId({ t: "pack-builder.saved-pack", saved })],
        }
      }
      default: {
        return { model }
      }
    }
  },
}

const PuzzleGrid: Pick<ServerModule, "update"> = {
  async update(input) {
    const pack = input.modelSync.packBuilder?.pack

    if (!pack) {
      return { model: input.model }
    }

    const ctx = { ...input.ctx, pack }

    const updated = await FlowPackPuzzleGridServer.update({
      ctx,
      model: {},
      msg:
        input.msg?.t === "pack-builder.flow-pack-puzzle-grid"
          ? input.msg.c
          : null,
      msgCmd: input.msgCmd,
      msgClient:
        input.msgClient?.t === "pack-builder.flow-pack-puzzle-grid"
          ? { ...input.msgClient, ...input.msgClient.c }
          : null,
      deps: input.deps,
      msgEvt: input.msgEvt,
    })

    return {
      model: input.model,
      eff: Eff.tag("pack-builder.flow-pack-puzzle-grid", updated.eff),
      msgCmd: SpaceServerCmd.tag(
        "pack-builder.flow-pack-puzzle-grid",
        updated.msgCmd,
      ),
      msgEvt: updated.msgEvt,
    }
  },
}

export const PackBuilderServer: Pick<ServerModule, "update"> = {
  async update(input) {
    return GameServerModule.chainUpdates(
      { model: input.model },
      (model) => SavePack.update({ ...input, model }),
      (model) => PuzzleGrid.update({ ...input, model }),
      //
    )
  },
}
