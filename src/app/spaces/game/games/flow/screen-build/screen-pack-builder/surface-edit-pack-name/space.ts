import { isErr, Loading, NotAsked } from '~/@/result'
import { Pack } from '../../../@/pack/pack'
import { PackName } from '../../../@/pack/pack-name'
import { UpdateSpace } from '../types'
import type { ModelSpace } from './types'

const initSpace = (input: { pack: Pack }): ModelSpace => {
  return {
    editPackName_draft: input.pack.name,
    editPackName_result: NotAsked,
    editPackName_validationError: null,
  }
}

const updateSpace: UpdateSpace = (input) => {
  switch (input.msgSpace.t) {
    case 'edit-pack-name.user-clicked-open-drawer-button': {
      return {
        ...input.modelSpace,
        opened: 'edit-pack-name-drawer',
      }
    }

    case 'edit-pack-name.user-closed-drawer': {
      return {
        ...input.modelSpace,
        opened: null,
      }
    }

    case 'edit-pack-name.user-submitted-form': {
      if (input.modelSpace.editPackName_draft.trim() === '') {
        return {
          ...input.modelSpace,
          editPackName_validationError: {
            t: 'name-cannot-be-empty',
          },
        }
      }

      const parsed = PackName.parse(input.modelSpace.editPackName_draft)

      if (isErr(parsed)) {
        return input.modelSpace
      }

      return {
        ...input.modelSpace,
        editPackName_result: Loading,
      }
    }

    case 'edit-pack-name.user-inputted-draft-name': {
      if (input.msgSpace.userId !== input.ctx.space.hostId) {
        return input.modelSpace
      }

      if (input.msgSpace.packNameDraft === '') {
        return {
          ...input.modelSpace,
          editPackName_validationError: {
            t: 'name-cannot-be-empty',
          },
        }
      }

      return {
        ...input.modelSpace,
        editPackName_draft: input.msgSpace.packNameDraft,
        editPackName_validationError: null,
      }
    }

    default: {
      return input.modelSpace
    }
  }
}

export const EditPackNameSpace = {
  updateSpace,
  initSpace,
}
