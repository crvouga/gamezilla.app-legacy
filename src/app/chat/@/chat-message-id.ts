import { Uuid } from '~/@/id/uuid'
import type { Brand } from '~/@/brand/brand'

export type ChatMessageId = Brand<string, 'ChatMessageId'>

const generate = (): ChatMessageId => {
  return Uuid.generate() as unknown as ChatMessageId
}

const is = (id: unknown): id is ChatMessageId => {
  return typeof id === 'string' && id.length > 0
}

export const ChatMessageId = {
  generate,
  is,
}
