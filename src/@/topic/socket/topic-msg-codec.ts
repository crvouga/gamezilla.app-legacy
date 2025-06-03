import { decode, encode } from '@msgpack/msgpack'

export type TopicMsgCodec = {
  encode: (msg: unknown) => unknown
  decodeWebSocketMessageEvent: (event: MessageEvent<any>) => Promise<unknown> | unknown
  decodeBunJsWebSocketMessage: (event: string | Buffer<ArrayBufferLike>) => Promise<unknown> | unknown
}

export const TopicMsgCodecJson: TopicMsgCodec = {
  encode: (msg) => {
    return JSON.stringify(msg)
  },
  decodeWebSocketMessageEvent: (event) => {
    return JSON.parse(event.data)
  },
  decodeBunJsWebSocketMessage: (event) => {
    return JSON.parse(event.toString())
  },
}

// https://www.npmjs.com/package/@msgpack/msgpack#decoding-a-blob
export const TopicMsgCodecMsgPack: TopicMsgCodec = {
  encode: (msg) => encode(msg),
  decodeBunJsWebSocketMessage: (msg) => {
    if (typeof msg === 'string') {
      throw new Error('CodecError: decodeFromBunJsWebSocketMessageEvent: string not supported')
    }
    return decode(msg)
  },
  decodeWebSocketMessageEvent: async (event) => {
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
  decodeBunJsWebSocketMessage: (_msg) => {
    throw new Error('CodecError: decode not implemented')
  },
  decodeWebSocketMessageEvent: (_event) => {
    throw new Error('CodecError: mapEvent not implemented')
  },
}
