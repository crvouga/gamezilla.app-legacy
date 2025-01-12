import { withEventId } from '~/@/event-sourced/event'
import type { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { FlowBackendCtx } from '../../../../@/backend/ctx'
import { EditPackNameCore } from '../core'
import type { ModelCore, MsgCore } from '../types'

type BackendModule = GameBackendModule<{
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowBackendCtx
}>

const update: BackendModule['update'] = async (input) => {
  switch (input.msgCore?.t) {
    case 'edit-pack-name.user-clicked-save-button': {
      const modelCoreNext = EditPackNameCore.update({
        ...input,
        msgCore: input.msgCore,
      })

      const put = await input.ctx.packDb.put(modelCoreNext.pack)

      return {
        msgCore: [
          withEventId({
            t: 'edit-pack-name.backend-persisted-pack',
            result: put,
            userId: input.msgCore.userId,
          }),
        ],
      }
    }
    default: {
      return {}
    }
  }
}

export const EditPackNameBackend = {
  update,
}
