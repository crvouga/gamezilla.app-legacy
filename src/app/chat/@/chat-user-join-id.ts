import { Uuid } from '~/@/id/uuid'
import type { Brand } from '~/@/brand/brand'

export type ChatUserJoinId = Brand<string, 'ChatUserJoinId'>

const generate = (): ChatUserJoinId => {
  return Uuid.generate() as unknown as ChatUserJoinId
}

const is = (id: unknown): id is ChatUserJoinId => {
  return typeof id === 'string' && id.length > 0
}

export const ChatUserJoinId = {
  generate,
  is,
}
