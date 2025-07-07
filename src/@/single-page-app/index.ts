import { IHttpServer } from "~/@/http-server"
import { IFileSystem } from "../file-system"
import { extToContentType } from "./ext-to-content-type"

const registerRespond = (config: {
    httpServer: IHttpServer
    directory: string
    indexFilename: string
    fs: IFileSystem
}) => {
    config.httpServer.registerRespond(async (request) => {
        const filePath = new URL(request.url).pathname.slice(1)
        
        if(await config.fs.exists(filePath)) { 
            const file = await config.fs.read(filePath)
            const contentType = extToContentType(filePath)
            return new Response(file, {headers: {'Content-Type': contentType,},})
        }

        const indexPath = `${config.directory}/${config.indexFilename}`
        const indexContent = await config.fs.read(indexPath)
        const indexContentType = extToContentType(config.indexFilename)
        return new Response(indexContent, {headers: { 'Content-Type': indexContentType }})
    })
}



export const SinglePageApp = {
 registerRespond,
}