import { SpaceServerModule } from '../architecture/space-server'

const update: SpaceServerModule['update'] = (input) => {
  return SpaceServerModule.andThen({}, () => updateFromSpaceEvent(input))
}

const updateFromSpaceEvent: SpaceServerModule['update'] = ({ msgCoreEvt }) => {
  switch (msgCoreEvt?.t) {
    case 'user-started-space': {
      return {}
    }
    default: {
      return {}
    }
  }
}

export const StartSpaceServer = {
  update
}
