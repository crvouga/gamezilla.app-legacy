import type { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space'
import type { FlowServerDeps } from '../../builder.types'
import { EditPackNameCore } from './edit-pack-name.core'
import type { ModelCore, MsgCore } from './edit-pack-name.types'

type ServerModule = GameServerModule<{
  Deps: FlowServerDeps
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: SpaceCtx
}>

const update: ServerModule['update'] = async (input) => {
  switch (input.msgCore?.t) {
    case 'edit-pack-name.user-clicked-save-button': {
      const modelCoreNext = EditPackNameCore.update({
        ...input,
        msgCore: input.msgCore
      })

      const put = await input.deps.flowPackDb.put(modelCoreNext.pack)

      return {
        model: input.model,
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
      return {
        model: input.model
      }
    }
  }
}

export const EditPackNameServer = {
  update
}
