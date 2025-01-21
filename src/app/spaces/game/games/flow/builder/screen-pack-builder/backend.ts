import { isErr } from '~/@/result'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import type { BackendModule } from '../types'
import { EditPackNameBackend } from './edit-pack-name/backend'
import { ScreenPackBuilderSpace } from './space'

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

      () => RemovedPuzzleFromPack.update(input),
      () => EditPackName.update(input),
    )
  },
}
