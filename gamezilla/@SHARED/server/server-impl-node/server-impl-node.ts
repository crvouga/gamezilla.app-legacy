import * as http from "node:http"
import { IServer } from "../server"

export const ServerNode = () => {
  const httpServer = new http.Server()
  const base: IServer = {
    async start(port) {
      await new Promise((resolve) => {
        httpServer.listen(port, undefined, undefined, () => {
          resolve(null)
        })
      })
    },
  }
  return {
    ...base,
    httpServer,
    t: "node",
  } as const
}

export type ServerNode = ReturnType<typeof ServerNode>
