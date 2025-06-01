import { s } from '~/@/schema'
import { TopicName, TopicParams } from './topic'

const MsgPayload = s.dict(s.str(), s.unknown)

export const SUB = 'sub'
export const UNSUB = 'unsub'
export const PUB = 'pub'

export const ToServerMsg = s.or(
  s.tuple(s.l(SUB), TopicName, TopicParams),
  s.tuple(s.l(UNSUB), TopicName, TopicParams),
  s.tuple(s.l(PUB), TopicName, TopicParams, MsgPayload),
)

export type ToServerMsg = s.Infer<typeof ToServerMsg>

export const ToClientMsgOne = s.or(
  s.tuple(s.l(SUB), TopicName, TopicParams),
  s.tuple(s.l(UNSUB), TopicName, TopicParams),
)

export type ToClientMsgOne = s.Infer<typeof ToClientMsgOne>

export const ToClientMsgMany = s.tuple(s.l(PUB), TopicName, TopicParams, MsgPayload)

export type ToClientMsgMany = s.Infer<typeof ToClientMsgMany>

export const ToClientMsg = s.or(ToClientMsgOne, ToClientMsgMany)

export type ToClientMsg = s.Infer<typeof ToClientMsg>
