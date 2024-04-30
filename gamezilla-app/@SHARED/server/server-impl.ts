import { ILogger } from "gamezilla-app/app/@shared/server/logger"
import { ServerBun } from "./server-impl-bun/server-impl-bun"
import { ServerNode } from "./server-impl-node/server-impl-node"

type Impl =
  | {
      t: "bun"
      logger: ILogger
    }
  | {
      t: "node"
      logger: ILogger
    }

export const Server = (impl: Impl) => {
  switch (impl.t) {
    case "bun": {
      return ServerBun<unknown>(impl)
    }

    case "node": {
      return ServerNode(impl)
    }
  }
}

export type ServerInstance = ReturnType<typeof Server>
