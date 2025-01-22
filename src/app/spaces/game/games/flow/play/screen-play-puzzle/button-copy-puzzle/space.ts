import type { SpaceModule } from '../../types'

export const updateSpace: SpaceModule['updateSpace'] = (input) => {
  switch (input.msgSpace.t) {
    case 'user-clicked-copy-to-clipboard': {
      return {
        ...input.modelSpace,
        screen: {
          ...input.modelSpace.screen,
          opened: null,
        },
      }
    }
    default: {
      return input.modelSpace
    }
  }
}
