import { Uuid } from '~/@/id/uuid'
import type { Brand } from '~/@/brand/brand'

export type ChatUserJoinId = Brand<string, 'ChatUserJoinId'>

const generate = (): ChatUserJoinId => {
  const id = Uuid.generate()
  return `chat-user-join:${id}` as ChatUserJoinId
}

const is = (id: unknown): id is ChatUserJoinId => {
  return typeof id === 'string' && id.startsWith('chat-user-join:')
}

export const ChatUserJoinId = {
  generate,
  is,
}
