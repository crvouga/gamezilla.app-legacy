import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'

export const ToServerMsg = s.or(
  s.tuple(s.l('sub'), s.str()),
  s.tuple(s.l('unsub'), s.str()),
  s.tuple(s.l('pub'), s.str(), s.unknown),
)

export type ToServerMsg = s.Infer<typeof ToServerMsg>

export const ToClientMsgOne = s.or(s.tuple(s.l('sub'), s.str()), s.tuple(s.l('unsub'), s.str()))

export type ToClientMsgOne = s.Infer<typeof ToClientMsgOne>

export const ToClientMsgMany = s.or(s.tuple(s.l('pub'), s.str(), s.unknown))

export type ToClientMsgMany = s.Infer<typeof ToClientMsgMany>

export const ToClientMsg = s.or(ToClientMsgOne, ToClientMsgMany)

export type ToClientMsg = s.Infer<typeof ToClientMsg>

export const toTopicString = (topicName: string, topicParams: unknown): string => {
  return [topicName, deterministicJsonStringify(topicParams)].join('/')
}
