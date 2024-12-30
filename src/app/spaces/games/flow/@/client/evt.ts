import { UserId } from '~/app/@/data/user-id'
import { SpaceClientEvt } from '~/app/spaces/@/space-client-evt'

export type FlowClientEvtIn = SpaceClientEvt | FlowClientEvt

export type FlowClientEvt = {
  t: 'flow.user-changed-mode'
  mode: 'play' | 'builder' | 'none'
  userId: UserId
}

const toFlowClientEvt = (evt: FlowClientEvtIn[] | null | undefined): FlowClientEvt[] => {
  return (evt ?? []).flatMap((evt): FlowClientEvt[] => {
    switch (evt.t) {
      case 'flow.user-changed-mode': {
        return [evt]
      }
      default: {
        return []
      }
    }
  })
}

const toSpaceClientEvt = (evt: FlowClientEvtIn[] | null | undefined): SpaceClientEvt[] => {
  return (evt ?? []).flatMap((evt): SpaceClientEvt[] => {
    switch (evt.t) {
      case 'flow.user-changed-mode': {
        return []
      }
      default: {
        return [evt]
      }
    }
  })
}

export const FlowClientEvt = {
  toFlowClientEvt,
  toSpaceClientEvt
}
