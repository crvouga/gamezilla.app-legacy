import type { SpaceModule } from '../../types'

const updateSpace: SpaceModule['updateSpace'] = ({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'user-clicked-select-next-pack': {
      return {
        ...modelSpace,
        screen: {
          t: 'screen-select-pack',
        },
      }
    }
    default: {
      return modelSpace
    }
  }
}

export const LastPuzzleSpace = {
  updateSpace,
}
