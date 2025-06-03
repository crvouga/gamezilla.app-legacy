import { s } from '~/@/schema'
import { TopicName, TopicParams } from './topic'

const MsgPayload = s.dict(s.str(), s.unknown)

export const SUB = 'sub'
export const UNSUB = 'unsub'
export const SUB_ALL = 'sub-all'
export const UNSUB_ALL = 'unsub-all'
export const PUB = 'pub'

export const MsgPub = s.tuple(s.l(PUB), TopicName, TopicParams, MsgPayload)
export type MsgPub = s.Infer<typeof MsgPub>

export const MsgSub = s.tuple(s.l(SUB), TopicName, TopicParams)
export type MsgSub = s.Infer<typeof MsgSub>

export const MsgUnsub = s.tuple(s.l(UNSUB), TopicName, TopicParams)
export type MsgUnsub = s.Infer<typeof MsgUnsub>

export const MsgSubAll = s.tuple(s.l(SUB_ALL), TopicName)
export type MsgSubAll = s.Infer<typeof MsgSubAll>

export const MsgUnsubAll = s.tuple(s.l(UNSUB_ALL), TopicName)
export type MsgUnsubAll = s.Infer<typeof MsgUnsubAll>

export const ToServerMsg = s.or(MsgPub, MsgSub, MsgUnsub, MsgSubAll, MsgUnsubAll)
export type ToServerMsg = s.Infer<typeof ToServerMsg>

export const ToClientMsgOne = s.or(MsgSub, MsgUnsub, MsgSubAll, MsgUnsubAll)
export type ToClientMsgOne = s.Infer<typeof ToClientMsgOne>

export const ToClientMsgMany = s.tuple(s.l(PUB), TopicName, TopicParams, MsgPayload)
export type ToClientMsgMany = s.Infer<typeof ToClientMsgMany>

export const ToClientMsg = s.or(ToClientMsgOne, ToClientMsgMany)
export type ToClientMsg = s.Infer<typeof ToClientMsg>
