import { withEventId } from '~/@/event-sourced/event'
import type { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { FlowBackendCtx } from '../../../../@/backend/ctx'
import { EditPackNameSpace } from '../space'
import type { ModelSpace, MsgSpace } from '../types'

type BackendModule = GameBackendModule<{
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
  Ctx: FlowBackendCtx
}>

const update: BackendModule['update'] = async (input) => {
  switch (input.msgSpace?.t) {
    case 'edit-pack-name.user-clicked-save-button': {
      const modelSpaceNext = EditPackNameSpace.update({
        ...input,
        msgSpace: input.msgSpace,
      })

      const put = await input.ctx.packDb.put(modelSpaceNext.pack)

      return {
        msgSpace: [
          withEventId({
            t: 'edit-pack-name.backend-persisted-pack',
            result: put,
            userId: input.msgSpace.userId,
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
