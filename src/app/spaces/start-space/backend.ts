import { SpaceBackendModule } from '../@/architecture/space-backend'

const update: SpaceBackendModule['update'] = (input) => {
  return SpaceBackendModule.andThen({}, () => updateFromSpaceEvent(input))
}

const updateFromSpaceEvent: SpaceBackendModule['update'] = ({ msgCore }) => {
  switch (msgCore?.t) {
    case 'user-started-space': {
      return {}
    }
    default: {
      return {}
    }
  }
}

export const StartSpaceBackend = {
  update,
}
