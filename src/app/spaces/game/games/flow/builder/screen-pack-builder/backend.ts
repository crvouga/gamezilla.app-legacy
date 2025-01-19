import { isErr } from '~/@/result'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'

import { PackPuzzlesGridBackend } from '../../@/pack/pack-puzzles-grid/backend'
import type { BackendModule } from '../types'
import { EditPackNameBackend } from './edit-pack-name/backend'
import { ScreenPackBuilderSpace } from './space'

const SavePack: Pick<BackendModule, 'update'> = {
  async update(input) {
    switch (input.msgSpace?.t) {
      case 'screen-pack-builder.user-clicked-add-puzzle-item': {
        if (!input.modelSpace.screenPackBuilder) {
          return {}
        }

        const saved = await input.ctx.packDb.put(input.modelSpace.screenPackBuilder.pack)

        return {
          msgSpace: [
            {
              t: 'screen-pack-builder.saved-pack',
              saved,
            },
          ],
        }
      }

      default: {
        return {}
      }
    }
  },
}

const PuzzleGrid: Pick<BackendModule, 'update'> = {
  async update(input) {
    const pack = input.modelSpace.screenPackBuilder?.pack

    if (!pack) {
      return {}
    }

    const ctx = {
      ...input.ctx,
      pack,
    }

    const updated = await PackPuzzlesGridBackend.update({
      ctx,
      msg: input.msg?.t === 'screen-pack-builder.flow-pack-grid' ? input.msg.c : null,
      msgCmd: input.msgCmd,
      msgFrontend:
        input.msgFrontend?.t === 'screen-pack-builder.flow-pack-grid'
          ? { ...input.msgFrontend, ...input.msgFrontend.c }
          : null,
      deps: input.deps,
      msgEvt: input.msgEvt,
    })

    return {
      msgCmd: SpaceBackendCmd.tag('screen-pack-builder.flow-pack-grid', updated.msgCmd),
      msgEvt: updated.msgEvt,
      msgSpace: [],
    }
  },
}

const RemovedPuzzleFromPack: Pick<BackendModule, 'update'> = {
  async update(input) {
    switch (input.msgSpace?.t) {
      case 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button': {
        const modelSpaceNew = ScreenPackBuilderSpace.update({
          ctx: input.ctx,
          modelSpace: input.modelSpace,
          msgSpace: input.msgSpace,
        })
        const packNew = modelSpaceNew.screenPackBuilder?.pack
        if (!packNew) {
          return {}
        }
        const put = await input.ctx.packDb.put(packNew)
        if (isErr(put)) {
          return {}
        }
        return {}
      }
    }
    return {}
  },
}

const EditPackName: Pick<BackendModule, 'update'> = {
  async update(input) {
    if (!input.modelSpace.screenPackBuilder) {
      return {}
    }
    const updated = await EditPackNameBackend.update({
      ...input,
      modelSpace: input.modelSpace.screenPackBuilder.editPackName,
      msgSpace: input.msgSpace?.t === 'got-edit-pack-name-msg' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    })
    return {
      msgSpace: (updated.msgSpace ?? []).map((c) => ({ c, t: 'got-edit-pack-name-msg' })),
    }
  },
}

export const ScreenPackBuilderBackend: Pick<BackendModule, 'update'> = {
  async update(input) {
    return GameBackendModule.andThen(
      {},
      () => SavePack.update(input),
      () => RemovedPuzzleFromPack.update(input),
      () => PuzzleGrid.update(input),
      () => EditPackName.update(input),
    )
  },
}
