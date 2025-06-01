import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'

const TopicName = s.arr(s.str())
const TopicParams = s.unknown

export const ToServerMsg = s.or(
  s.tuple(s.l('sub'), TopicName, TopicParams),
  s.tuple(s.l('unsub'), TopicName, TopicParams),
  s.tuple(s.l('pub'), TopicName, TopicParams, s.str()),
)

export type ToServerMsg = s.Infer<typeof ToServerMsg>

export const ToClientMsgOne = s.or(
  s.tuple(s.l('sub'), TopicName, TopicParams),
  s.tuple(s.l('unsub'), TopicName, TopicParams),
)

export type ToClientMsgOne = s.Infer<typeof ToClientMsgOne>

export const ToClientMsgMany = s.or(s.tuple(s.l('pub'), TopicName, TopicParams, s.str()))

export type ToClientMsgMany = s.Infer<typeof ToClientMsgMany>

export const ToClientMsg = s.or(ToClientMsgOne, ToClientMsgMany)

export type ToClientMsg = s.Infer<typeof ToClientMsg>

export const toTopicString = (topicName: string[], topicParams: unknown): string => {
  return [...topicName, deterministicJsonStringify(topicParams)].join('/')
}
