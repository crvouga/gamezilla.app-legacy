import { ICompress } from './interface'

export type Config = {
  t: 'bun'
}

export const Compress = (_config: Config): ICompress => {
  return {
    gzipSync(data) {
      return Bun.gzipSync(data)
    },
    async gzipReadableStream(stream) {
      const buf = await Bun.readableStreamToArrayBuffer(
        // @ts-ignore
        stream,
      )
      const compressed = Bun.gzipSync(buf)
      return compressed
    },
    async gzipResponse(response) {
      const buf = await response.arrayBuffer()
      const responseNew = new Response(Bun.gzipSync(buf))
      for (const [key, value] of response.headers.entries()) {
        responseNew.headers.set(key, value)
      }
      responseNew.headers.set('Content-Encoding', 'gzip')
      return responseNew
    },
  }
}
