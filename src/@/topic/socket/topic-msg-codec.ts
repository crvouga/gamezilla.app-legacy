import { decode, encode } from '@msgpack/msgpack'

export type TopicMsgCodec = {
  encode: (msg: unknown) => unknown
  decodeMessageClient: (event: MessageEvent<any>) => Promise<unknown> | unknown
  decodeMessageServer: (event: string | Buffer<ArrayBufferLike>) => Promise<unknown> | unknown
}

export const TopicMsgCodecJson: TopicMsgCodec = {
  encode: (msg) => {
    return JSON.stringify(msg)
  },
  decodeMessageClient: (event) => {
    if (event.data instanceof Blob) {
      // Check if arrayBuffer method exists (may not be available in test environments)
      if (typeof event.data.arrayBuffer === 'function') {
        return event.data.arrayBuffer().then((buffer) => {
          return JSON.parse(new TextDecoder().decode(buffer))
        })
      } else {
        // Fallback for test environments - use FileReader
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              resolve(JSON.parse(reader.result as string))
            } catch (error) {
              reject(error)
            }
          }
          reader.onerror = () => reject(reader.error)
          reader.readAsText(event.data)
        })
      }
    }
    if (typeof event.data === 'string') {
      return JSON.parse(event.data)
    }
    return JSON.parse(new TextDecoder().decode(event.data))
  },
  decodeMessageServer: (event) => {
    return JSON.parse(event.toString())
  },
}

// https://www.npmjs.com/package/@msgpack/msgpack#decoding-a-blob
export const TopicMsgCodecMsgPack: TopicMsgCodec = {
  encode: (msg) => encode(msg),
  decodeMessageServer: (msg) => {
    if (typeof msg === 'string') {
      throw new Error('CodecError: decodeFromBunJsWebSocketMessageEvent: string not supported')
    }
    return decode(msg)
  },
  decodeMessageClient: async (event) => {
    if (event.data instanceof Blob) {
      return decode(await event.data.arrayBuffer())
    }
    return decode(event.data)
  },
}

export const TopicMsgCodecError: TopicMsgCodec = {
  encode: (_msg) => {
    throw new Error('CodecError: encode not implemented')
  },
  decodeMessageServer: (_msg) => {
    throw new Error('CodecError: decode not implemented')
  },
  decodeMessageClient: (_event) => {
    throw new Error('CodecError: mapEvent not implemented')
  },
}
