import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'

export const ToServerMsg = s.or(
  s.obj({
    t: s.l('subscribe'),
    topicString: s.str(),
    topicName: s.arr(s.str()),
    topicParams: s.unknown,
  }),
  s.obj({
    t: s.l('unsubscribe'),
    topicString: s.str(),
    topicName: s.arr(s.str()),
    topicParams: s.unknown,
  }),
  s.obj({
    t: s.l('publish'),
    topicString: s.str(),
    topicName: s.arr(s.str()),
    topicParams: s.unknown,
    msg: s.str(),
  }),
)

export type ToServerMsg = s.Infer<typeof ToServerMsg>

export const ToClientMsgOne = s.or(
  s.obj({
    t: s.l('subscribed'),
    topicString: s.str(),
    topicName: s.arr(s.str()),
    topicParams: s.unknown,
  }),
  s.obj({
    t: s.l('unsubscribed'),
    topicString: s.str(),
    topicName: s.arr(s.str()),
    topicParams: s.unknown,
  }),
)

export type ToClientMsgOne = s.Infer<typeof ToClientMsgOne>

export const ToClientMsgMany = s.or(
  s.obj({
    t: s.l('published'),
    topicString: s.str(),
    topicName: s.arr(s.str()),
    topicParams: s.unknown,
    msg: s.str(),
  }),
)

export type ToClientMsgMany = s.Infer<typeof ToClientMsgMany>

export const ToClientMsg = s.or(ToClientMsgOne, ToClientMsgMany)

export type ToClientMsg = s.Infer<typeof ToClientMsg>

export const toTopicString = (topicName: string[], topicParams: unknown): string => {
  return [...topicName, deterministicJsonStringify(topicParams)].join('/')
}
