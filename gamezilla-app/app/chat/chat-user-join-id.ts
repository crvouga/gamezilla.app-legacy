import { Uuid } from "gamezilla-app/@shared/core"
import { Brand } from "gamezilla-app/@shared/core/brand"

export type ChatUserJoinId = Brand<string, "ChatUserJoinId">

const generate = (): ChatUserJoinId => {
  const id = Uuid.generate()
  return `chat-user-join:${id}` as ChatUserJoinId
}

const is = (id: unknown): id is ChatUserJoinId => {
  return typeof id === "string" && id.startsWith("chat-user-join:")
}

export const ChatUserJoinId = {
  generate,
  is,
}
