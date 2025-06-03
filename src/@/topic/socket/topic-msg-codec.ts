import { decode, encode } from '@msgpack/msgpack'

export type TopicMsgCodec = {
  encode: (msg: unknown) => unknown
  decode: (msg: unknown) => unknown
  decodeFromWebSocketMessageEvent: (event: MessageEvent<any>) => Promise<unknown> | unknown
}

export const TopicMsgCodecJson: TopicMsgCodec = {
  encode: (msg) => JSON.stringify(msg),
  decode: (msg) =>
    JSON.parse(
      // @ts-expect-error
      msg,
    ),
  decodeFromWebSocketMessageEvent: (event) => {
    return JSON.parse(event.data)
  },
}

// https://www.npmjs.com/package/@msgpack/msgpack#decoding-a-blob
export const TopicMsgCodecMsgPack: TopicMsgCodec = {
  encode: (msg) => encode(msg),
  decode: (msg) => decode(msg as ArrayBufferLike),
  decodeFromWebSocketMessageEvent: async (event) => {
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
  decode: (_msg) => {
    throw new Error('CodecError: decode not implemented')
  },
  decodeFromWebSocketMessageEvent: (_event) => {
    throw new Error('CodecError: mapEvent not implemented')
  },
}
