import { decode, encode } from '@msgpack/msgpack'

export type TopicMsgCodec = {
  encode: (msg: any) => any
  decode: (msg: any) => any
}

export const TopicMsgCodecJson: TopicMsgCodec = {
  encode: (msg) => JSON.stringify(msg),
  decode: (msg) => JSON.parse(msg),
}

export const TopicMsgCodecMsgPack: TopicMsgCodec = {
  encode,
  decode,
}

export const TopicMsgCodecError: TopicMsgCodec = {
  encode: (_msg) => {
    throw new Error('CodecError: encode not implemented')
  },
  decode: (_msg) => {
    throw new Error('CodecError: decode not implemented')
  },
}
