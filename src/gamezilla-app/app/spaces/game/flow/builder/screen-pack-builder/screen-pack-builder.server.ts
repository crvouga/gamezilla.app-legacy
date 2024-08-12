import { Eff, isErr } from 'gamezilla-app/@/core'
import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'

import { FlowPackPuzzlesGridServer } from '../../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid.server'
import type { ServerModule } from '../builder.types'
import { EditPackNameServer } from './edit-pack-name/edit-pack-name.server'
import { ScreenPackBuilderCore } from './screen-pack-builder.core'

const SavePack: Pick<ServerModule, 'update'> = {
  async update(input) {
    const { deps, modelCore, msgCore } = input

    switch (msgCore?.t) {
      case 'screen-pack-builder.user-clicked-add-puzzle-item': {
        if (!modelCore.packBuilder) {
          return {}
        }

        const saved = await deps.flowPackDb.put(modelCore.packBuilder.pack)

        return {
          msgCore: [
            withId({
              t: 'screen-pack-builder.saved-pack',
              saved
            })
          ]
        }
      }

      default: {
        return {}
      }
    }
  }
}

const PuzzleGrid: Pick<ServerModule, 'update'> = {
  async update(input) {
    const pack = input.modelCore.packBuilder?.pack

    if (!pack) {
      return {}
    }

    const ctx = {
      ...input.ctx,
      pack
    }

    const updated = await FlowPackPuzzlesGridServer.update({
      ctx,
      model: {},
      msg: input.msg?.t === 'screen-pack-builder.flow-pack-grid' ? input.msg.c : null,
      msgCmd: input.msgCmd,
      msgClient:
        input.msgClient?.t === 'screen-pack-builder.flow-pack-grid'
          ? {
              ...input.msgClient,
              ...input.msgClient.c
            }
          : null,
      deps: input.deps,
      msgEvt: input.msgEvt
    })

    return {
      eff: Eff.tag('screen-pack-builder.flow-pack-grid', updated.eff),
      msgCmd: SpaceServerCmd.tag('screen-pack-builder.flow-pack-grid', updated.msgCmd),
      msgEvt: updated.msgEvt,
      msgCore: []
    }
  }
}

const RemovedPuzzleFromPack: Pick<ServerModule, 'update'> = {
  async update(input) {
    switch (input.msgCore?.t) {
      case 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button': {
        const modelCoreNew = ScreenPackBuilderCore.update({
          ctx: input.ctx,
          modelCore: input.modelCore,
          msgCore: input.msgCore
        })
        const packNew = modelCoreNew.packBuilder?.pack
        if (!packNew) {
          return {}
        }
        const put = await input.deps.flowPackDb.put(packNew)
        if (isErr(put)) {
          return {}
        }
        return {}
      }
    }
    return {}
  }
}

const EditPackName: Pick<ServerModule, 'update'> = {
  async update(input) {
    if (!input.modelCore.packBuilder) {
      return {}
    }
    const updated = await EditPackNameServer.update({
      ...input,
      modelCore: input.modelCore.packBuilder.editPackName,
      msgCore:
        input.msgCore?.t === 'got-edit-pack-name-msg'
          ? {
              ...input.msgCore,
              ...input.msgCore.c
            }
          : null
    })
    return {
      msgCore: (updated.msgCore ?? []).map(({ eventId, ...c }) => ({
        eventId,
        c,
        t: 'got-edit-pack-name-msg'
      }))
    }
  }
}

export const ScreenPackBuilderServer: Pick<ServerModule, 'update'> = {
  async update(input) {
    return GameServerModule.andThen(
      {},
      () => SavePack.update(input),
      () => RemovedPuzzleFromPack.update(input),
      () => PuzzleGrid.update(input),
      () => EditPackName.update(input)
    )
  }
}
