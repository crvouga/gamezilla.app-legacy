import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'

const MsgPayload = s.dict(s.str(), s.unknown)

const Topic = s.str()

export const SUB = 's'
export const UNSUB = 'u'
export const PUB = 'p'

export const ToServerMsg = s.or(
  s.tuple(s.l(SUB), Topic),
  s.tuple(s.l(UNSUB), Topic),
  s.tuple(s.l(PUB), Topic, MsgPayload),
)

export type ToServerMsg = s.Infer<typeof ToServerMsg>

export const ToClientMsgOne = s.or(s.tuple(s.l(SUB), Topic), s.tuple(s.l(UNSUB), Topic))

export type ToClientMsgOne = s.Infer<typeof ToClientMsgOne>

export const ToClientMsgMany = s.tuple(s.l(PUB), Topic, MsgPayload)

export type ToClientMsgMany = s.Infer<typeof ToClientMsgMany>

export const ToClientMsg = s.or(ToClientMsgOne, ToClientMsgMany)

export type ToClientMsg = s.Infer<typeof ToClientMsg>

export const toTopicString = (topicName: string, topicParams: unknown): string => {
  return [topicName, deterministicJsonStringify(topicParams)].join('/')
}
