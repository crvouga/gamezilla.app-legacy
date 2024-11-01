import { isErr } from 'gamezilla-app/@/core'
import { GameServerModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-server-v2'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'

import { FlowPackPuzzlesGridServer } from '../../@/pack/pack-puzzles-grid/pack-puzzles-grid.server'
import type { ServerModule } from '../types'
import { EditPackNameServer } from './edit-pack-name/server'
import { ScreenPackBuilderCore } from './core'

const SavePack: Pick<ServerModule, 'update'> = {
  async update(input) {
    switch (input.msgCore?.t) {
      case 'screen-pack-builder.user-clicked-add-puzzle-item': {
        if (!input.modelCore.screenPackBuilder) {
          return {}
        }

        const saved = await input.ctx.flowPackDb.put(input.modelCore.screenPackBuilder.pack)

        return {
          msgCore: [
            {
              t: 'screen-pack-builder.saved-pack',
              saved
            }
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
    const pack = input.modelCore.screenPackBuilder?.pack

    if (!pack) {
      return {}
    }

    const ctx = {
      ...input.ctx,
      pack
    }

    const updated = await FlowPackPuzzlesGridServer.update({
      ctx,
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
        const packNew = modelCoreNew.screenPackBuilder?.pack
        if (!packNew) {
          return {}
        }
        const put = await input.ctx.flowPackDb.put(packNew)
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
    if (!input.modelCore.screenPackBuilder) {
      return {}
    }
    const updated = await EditPackNameServer.update({
      ...input,
      modelCore: input.modelCore.screenPackBuilder.editPackName,
      msgCore:
        input.msgCore?.t === 'got-edit-pack-name-msg'
          ? {
              ...input.msgCore,
              ...input.msgCore.c
            }
          : null
    })
    return {
      msgCore: (updated.msgCore ?? []).map((c) => ({ c, t: 'got-edit-pack-name-msg' }))
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
