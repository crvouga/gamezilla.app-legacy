import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { s } from '~/@/schema'

export const ToServer = s.or(
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

export type ToServerMsg = s.Infer<typeof ToServer>

export const ToClient = s.or(
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
    msg: s.unknown,
  }),
)

export type ToClientMsg = s.Infer<typeof ToClient>

export const initToClient = (msg: ToClientMsg): ToClientMsg => {
  return msg
}

export const toTopicString = (input: { topicName: string[]; topicParams: unknown }): string => {
  return [...input.topicName, deterministicJsonStringify(input.topicParams)].join('/')
}
