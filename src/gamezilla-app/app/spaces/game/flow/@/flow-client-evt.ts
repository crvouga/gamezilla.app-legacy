import { UserId } from 'gamezilla-app/app/@/data'
import { SpaceClientEvt } from 'gamezilla-app/app/spaces/@/space'

export type FlowClientEvtIn = SpaceClientEvt | FlowClientEvt

export type FlowClientEvt = {
  t: 'flow.user-changed-mode'
  mode: 'play' | 'builder' | null
  userId: UserId
}
