import { Uuid } from '~/@/id/uuid'
import type { Brand } from '~/@/brand/brand'

export type ChatMessageId = Brand<string, 'ChatMessageId'>

const generate = (): ChatMessageId => {
  return Uuid.generate() as unknown as ChatMessageId
}

const is = (id: unknown): id is ChatMessageId => {
  return typeof id === 'string' && Uuid.is(id)
}

export const ChatMessageId = {
  generate,
  is,
}
