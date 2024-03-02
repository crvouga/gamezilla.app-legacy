import * as fs from "node:fs"
import * as http from "node:http"
import * as path from "node:path"
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
    serveSinglePageApp(input) {
      serveSinglePageApp(httpServer)(input)
    },
  }
  return {
    ...base,
    httpServer,
    t: "node",
  } as const
}

export type ServerNode = ReturnType<typeof ServerNode>

const fileExtensionToContentType = (ext: string) => {
  switch (ext) {
    case ".html":
      return "text/html"
    case ".css":
      return "text/css"
    case ".js":
      return "application/javascript"
    case ".png":
      return "image/png"
    default:
      return "text/html"
  }
}

const serveSinglePageApp =
  (httpServer: http.Server): IServer["serveSinglePageApp"] =>
  (input) => {
    httpServer.on("request", (req, res) => {
      let filePath = path.join(
        input.directory,
        req.url === "/" ? input.file : req.url ?? "",
      )

      const ext = path.extname(filePath)

      if (!ext) {
        filePath = path.join(input.directory, input.file)
      }

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404)
          res.end("Not Found")
          return
        }

        const contentType = fileExtensionToContentType(ext)

        res.writeHead(200, { "Content-Type": contentType })
        res.end(content, "utf-8")
      })
    })
  }
