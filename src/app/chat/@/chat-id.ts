import { Uuid } from '~/@/id/uuid'
import type { Brand } from '~/@/brand/brand'

export type ChatId = Brand<string, 'ChatId'>

const generate = (): ChatId => {
  return Uuid.generate() as unknown as ChatId
}

const is = (id: unknown): id is ChatId => {
  return typeof id === 'string' && Uuid.is(id)
}

export const ChatId = {
  generate,
  is,
}
