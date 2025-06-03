import { decode, encode } from '@msgpack/msgpack'

export type TopicMsgCodec = {
  encode: (msg: unknown) => unknown
  decode: (msg: unknown) => unknown
  socketMessageEventToMsgFromServer: (event: MessageEvent<any>) => Promise<unknown> | unknown
}

export const TopicMsgCodecJson: TopicMsgCodec = {
  encode: (msg) => JSON.stringify(msg),
  decode: (msg) =>
    JSON.parse(
      // @ts-expect-error
      msg,
    ),
  socketMessageEventToMsgFromServer: (event) => {
    return event.data
  },
}

export const TopicMsgCodecMsgPack: TopicMsgCodec = {
  encode: (msg) => encode(msg),
  decode: (msg) => decode(msg as ArrayBufferLike),
  socketMessageEventToMsgFromServer: async (event) => {
    const arrayBuffer = await event.data.arrayBuffer()
    return arrayBuffer
  },
}

export const TopicMsgCodecError: TopicMsgCodec = {
  encode: (_msg) => {
    throw new Error('CodecError: encode not implemented')
  },
  decode: (_msg) => {
    throw new Error('CodecError: decode not implemented')
  },
  socketMessageEventToMsgFromServer: (_event) => {
    throw new Error('CodecError: mapEvent not implemented')
  },
}
