import { Uuid } from "gamezilla-app/@shared/core"
import { Brand } from "gamezilla-app/@shared/core/brand"

export type ChatMessageId = Brand<string, "ChatMessageId">

const generate = (): ChatMessageId => {
  const id = Uuid.generate()
  return `chat-message:${id}` as ChatMessageId
}

const is = (id: unknown): id is ChatMessageId => {
  return typeof id === "string" && id.startsWith("chat-message:")
}

export const ChatMessageId = {
  generate,
  is,
}
