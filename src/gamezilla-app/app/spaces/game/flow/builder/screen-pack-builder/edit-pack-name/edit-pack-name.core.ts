import { isErr, Loading, NotAsked } from 'gamezilla-app/@/core'
import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space'
import { FlowPack } from '../../../@/pack/pack'
import { FlowPackName } from '../../../@/pack/pack-name'
import type { ModelCore, MsgCore } from './edit-pack-name.types'

const init = (input: { pack: FlowPack }): ModelCore => {
  return {
    pack: input.pack,
    rollback: input.pack.name,
    draft: '',
    result: NotAsked,
    validationError: null
  }
}

const update = <TModel extends ModelCore, TMsg extends MsgCore>(input: {
  ctx: SpaceCtx
  modelCore: TModel
  msgCore: TMsg
}): TModel => {
  switch (input.msgCore.t) {
    case 'edit-pack-name.user-clicked-save-button': {
      const parsed = FlowPackName.parse(input.modelCore.draft)

      if (isErr(parsed)) {
        return input.modelCore
      }

      return {
        ...input.modelCore,
        pack: {
          ...input.modelCore.pack,
          name: parsed.value
        },
        result: Loading
      }
    }

    case 'edit-pack-name.user-inputted-draft-name': {
      if (input.msgCore.userId !== input.ctx.space.hostId) {
        return input.modelCore
      }

      if (input.msgCore.packNameDraft === '') {
        return {
          ...input.modelCore,
          validationError: {
            t: 'name-cannot-be-empty'
          }
        }
      }

      return {
        ...input.modelCore,
        draft: input.msgCore.packNameDraft,
        validationError: null
      }
    }

    case 'edit-pack-name.server-persisted-pack': {
      if (isErr(input.msgCore.result)) {
        return {
          ...input.modelCore,
          result: input.msgCore.result,
          pack: {
            ...input.modelCore.pack,
            name: input.modelCore.rollback
          }
        }
      }
      return {
        ...input.modelCore,
        result: input.msgCore.result
      }
    }

    default: {
      return input.modelCore
    }
  }
}

export const EditPackNameCore = {
  update,
  init
}
