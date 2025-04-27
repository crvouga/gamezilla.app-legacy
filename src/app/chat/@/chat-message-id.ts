import { Uuid } from '~/@/id/uuid'
import type { Brand } from '~/@/brand/brand'

export type ChatMessageId = Brand<string, 'ChatMessageId'>

const generate = (): ChatMessageId => {
  const id = Uuid.generate()
  return `chat-message:${id}` as ChatMessageId
}

const is = (id: unknown): id is ChatMessageId => {
  return typeof id === 'string' && id.startsWith('chat-message:')
}

export const ChatMessageId = {
  generate,
  is,
}
