import { UserId } from '~/app/@/data/user-id'
import { SpaceFrontendEvt } from '~/app/spaces/@/frontend/evt'

export type FlowFrontendEvtIn = SpaceFrontendEvt | FlowFrontendEvt

export type FlowFrontendEvt = {
  t: 'flow-evt.user-changed-mode'
  mode: 'play' | 'build' | 'none'
  userId: UserId
}

const toFlowFrontendEvt = (evt: FlowFrontendEvtIn[] | null | undefined): FlowFrontendEvt[] => {
  return (evt ?? []).flatMap((evt): FlowFrontendEvt[] => {
    switch (evt.t) {
      case 'flow-evt.user-changed-mode': {
        return [evt]
      }
      default: {
        return []
      }
    }
  })
}

const toSpaceFrontendEvt = (evt: FlowFrontendEvtIn[] | null | undefined): SpaceFrontendEvt[] => {
  return (evt ?? []).flatMap((evt): SpaceFrontendEvt[] => {
    switch (evt.t) {
      case 'flow-evt.user-changed-mode': {
        return []
      }
      default: {
        return [evt]
      }
    }
  })
}

export const FlowFrontendEvt = {
  toFlowFrontendEvt,
  toSpaceFrontendEvt,
}
