import { Uuid } from "gamezilla-app/@shared/core"
import { Brand } from "gamezilla-app/@shared/core/brand"

export type ChatId = Brand<string, "ChatId">

const generate = (): ChatId => {
  const id = Uuid.generate()
  return `chat:${id}` as ChatId
}

const is = (id: unknown): id is ChatId => {
  return typeof id === "string" && id.startsWith("chat:")
}

export const ChatId = {
  generate,
  is,
}
