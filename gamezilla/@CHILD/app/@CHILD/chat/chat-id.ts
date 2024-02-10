import { Uuid } from "gamezilla/@SHARED/core"

export type ChatId = string & { readonly ChatId: unique symbol }

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
