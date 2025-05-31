import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'

export const ToServerMsg = s.or(
  s.obj({
    t: s.l('subscribe'),
    topicName: s.arr(s.str),
    topicParams: s.unknown,
  }),
  s.obj({
    t: s.l('unsubscribe'),
    topicName: s.arr(s.str),
    topicParams: s.unknown,
  }),
  s.obj({
    t: s.l('publish'),
    topicName: s.arr(s.str),
    topicParams: s.unknown,
    msg: s.str,
  }),
)

export type ToServerMsg = s.Infer<typeof ToServerMsg>

export const ToClientMsg = s.or(
  s.obj({
    t: s.l('subscribed'),
    topicName: s.arr(s.str),
    topicParams: s.unknown,
  }),
  s.obj({
    t: s.l('unsubscribed'),
    topicName: s.arr(s.str),
    topicParams: s.unknown,
  }),
  s.obj({
    t: s.l('published'),
    topicName: s.arr(s.str),
    topicParams: s.unknown,
    msg: s.str,
  }),
)

export type ToClientMsg = s.Infer<typeof ToClientMsg>

export const initToClient = (msg: ToClientMsg): ToClientMsg => {
  return msg
}

export const toTopicString = (topicName: string[], topicParams: unknown): string => {
  return [...topicName, deterministicJsonStringify(topicParams)].join('/')
}
