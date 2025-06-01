import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'

const TopicName = s.arr(s.str())
const TopicParams = s.unknown

export const MSG_TYPE_SUB = 'sub'
export const MSG_TYPE_UNSUB = 'unsub'
export const MSG_TYPE_PUB = 'pub'
//
export const MSG_TYPE_SUBBED = 'sub'
export const MSG_TYPE_UNSUBBED = 'unsub'
export const MSG_TYPE_PUBED = 'pub'

export const ToServerMsg = s.or(
  s.tuple(s.l(MSG_TYPE_SUB), TopicName, TopicParams),
  s.tuple(s.l(MSG_TYPE_UNSUB), TopicName, TopicParams),
  s.tuple(s.l(MSG_TYPE_PUB), TopicName, TopicParams, s.str()),
)

export type ToServerMsg = s.Infer<typeof ToServerMsg>

export const ToClientMsgOne = s.or(
  s.tuple(s.l(MSG_TYPE_SUBBED), TopicName, TopicParams),
  s.tuple(s.l(MSG_TYPE_UNSUBBED), TopicName, TopicParams),
)

export type ToClientMsgOne = s.Infer<typeof ToClientMsgOne>

export const ToClientMsgMany = s.or(s.tuple(s.l(MSG_TYPE_PUBED), TopicName, TopicParams, s.str()))

export type ToClientMsgMany = s.Infer<typeof ToClientMsgMany>

export const ToClientMsg = s.or(ToClientMsgOne, ToClientMsgMany)

export type ToClientMsg = s.Infer<typeof ToClientMsg>

export const toTopicString = (topicName: string[], topicParams: unknown): string => {
  return [...topicName, deterministicJsonStringify(topicParams)].join('/')
}
