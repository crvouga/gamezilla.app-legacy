import type { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import { FlowServerCtx } from '../../../@/flow-server-ctx'
import { EditPackNameCore } from './edit-pack-name.core'
import type { ModelCore, MsgCore } from './edit-pack-name.types'

type ServerModule = GameServerModule<{
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: FlowServerCtx
}>

const update: ServerModule['update'] = async (input) => {
  switch (input.msgCore?.t) {
    case 'edit-pack-name.user-clicked-save-button': {
      const modelCoreNext = EditPackNameCore.update({
        ...input,
        msgCore: input.msgCore
      })

      const put = await input.ctx.flowPackDb.put(modelCoreNext.pack)

      return {
        msgCore: [
          withId({
            t: 'edit-pack-name.server-persisted-pack',
            result: put,
            userId: input.msgCore.userId
          })
        ]
      }
    }
    default: {
      return {}
    }
  }
}

export const EditPackNameServer = {
  update
}
