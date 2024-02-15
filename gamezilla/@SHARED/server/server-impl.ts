import { ServerBun } from "./server-impl-bun"
import { ServerNode } from "./server-impl-node"

export const Server = (impl: "bun" | "node") => {
  switch (impl) {
    case "bun": {
      return ServerBun<unknown>()
    }

    case "node": {
      return ServerNode()
    }
  }
}

export type ServerInstance = ReturnType<typeof Server>
