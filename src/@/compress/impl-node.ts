import { gzipSync } from 'zlib'
import { ICompress } from './interface'

export type Config = {
  t: 'node'
}

export const Compress = (_config: Config): ICompress => {
  return {
    gzipSync(data) {
      let buffer: Buffer
      if (typeof data === 'string') {
        buffer = Buffer.from(data)
      } else if (data instanceof ArrayBuffer) {
        buffer = Buffer.from(data)
      } else {
        buffer = Buffer.from(data)
      }
      return new Uint8Array(gzipSync(buffer)) as Uint8Array<ArrayBufferLike>
    },
    async gzipReadableStream(stream) {
      const reader = stream.getReader()
      const chunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(new Uint8Array(value as ArrayBuffer))
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const buffer = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        buffer.set(chunk, offset)
        offset += chunk.length
      }

      return new Uint8Array(gzipSync(Buffer.from(buffer))) as Uint8Array<ArrayBufferLike>
    },
    async gzipResponse(response) {
      const buf = await response.arrayBuffer()
      const compressed = gzipSync(Buffer.from(buf))
      const responseNew = new Response(compressed)
      for (const [key, value] of response.headers.entries()) {
        responseNew.headers.set(key, value)
      }
      responseNew.headers.set('Content-Encoding', 'gzip')
      return responseNew
    },
  }
}
