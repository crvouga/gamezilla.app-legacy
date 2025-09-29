import { WithEventMeta } from '~/@/event-sourced/event'
import { isAnyMsg } from '~/@/msg/msg'
import { s } from '~/@/schema'
import { MsgSpace } from '../space/msg-space'

export const schema = s.or(
  s.obj({
    t: s.l('got-space-msg'),
    c: WithEventMeta(MsgSpace),
  }),
)

export type GotSpaceMsg = s.Infer<typeof schema>

export type MsgShared = GotSpaceMsg

export const init = (c: WithEventMeta<MsgSpace>): GotSpaceMsg => {
  return {
    t: 'got-space-msg',
    c,
  }
}

const is = (evt: unknown): evt is GotSpaceMsg => {
  return isAnyMsg(evt) && evt.t.startsWith('got-space-msg')
}

export const GotSpaceMsg = {
  is,
  init,
}
