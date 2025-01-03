import { ICompress } from './interface'

export type Config = {
  t: 'noop'
}

export const Compress = (_config: Config): ICompress => {
  return {
    gzipSync(data) {
      if (typeof data === 'string') {
        return new TextEncoder().encode(data)
      }
      if (data instanceof Uint8Array) {
        return data
      }
      return new Uint8Array(data)
    },
    async gzipReadableStream(stream) {
      const buf = await new Response(stream).arrayBuffer()
      return new Uint8Array(buf)
    },
    async gzipResponse(response) {
      return response
    }
  }
}
