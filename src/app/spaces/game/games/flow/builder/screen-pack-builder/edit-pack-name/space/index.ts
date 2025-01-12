import { isErr, Loading, NotAsked } from '~/@/result'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { Pack } from '../../../../@/pack/pack'
import { PackName } from '../../../../@/pack/pack-name'
import type { ModelSpace, MsgSpace } from '../types'

const init = (input: { pack: Pack }): ModelSpace => {
  return {
    pack: input.pack,
    rollback: input.pack.name,
    draft: '',
    result: NotAsked,
    validationError: null,
  }
}

const update = <TModel extends ModelSpace, TMsg extends MsgSpace>(input: {
  ctx: SpaceCtx
  modelSpace: TModel
  msgSpace: TMsg
}): TModel => {
  switch (input.msgSpace.t) {
    case 'edit-pack-name.user-clicked-save-button': {
      const parsed = PackName.parse(input.modelSpace.draft)

      if (isErr(parsed)) {
        return input.modelSpace
      }

      return {
        ...input.modelSpace,
        pack: {
          ...input.modelSpace.pack,
          name: parsed.value,
        },
        result: Loading,
      }
    }

    case 'edit-pack-name.user-inputted-draft-name': {
      if (input.msgSpace.userId !== input.ctx.space.hostId) {
        return input.modelSpace
      }

      if (input.msgSpace.packNameDraft === '') {
        return {
          ...input.modelSpace,
          validationError: {
            t: 'name-cannot-be-empty',
          },
        }
      }

      return {
        ...input.modelSpace,
        draft: input.msgSpace.packNameDraft,
        validationError: null,
      }
    }

    case 'edit-pack-name.backend-persisted-pack': {
      if (isErr(input.msgSpace.result)) {
        return {
          ...input.modelSpace,
          result: input.msgSpace.result,
          pack: {
            ...input.modelSpace.pack,
            name: input.modelSpace.rollback,
          },
        }
      }
      return {
        ...input.modelSpace,
        result: input.msgSpace.result,
      }
    }

    default: {
      return input.modelSpace
    }
  }
}

export const EditPackNameSpace = {
  update,
  init,
}
