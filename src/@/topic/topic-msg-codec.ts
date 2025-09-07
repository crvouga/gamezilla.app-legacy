export type EncodedMsg = string | Buffer<ArrayBufferLike> | ArrayBufferLike | Blob | ArrayBufferView

export type ITopicMsgCodec = {
  encode: (msg: unknown) => EncodedMsg
  decodeMessageClient: (event: MessageEvent<any>) => Promise<unknown> | unknown
  decodeMessageServer: (event: EncodedMsg) => Promise<unknown> | unknown
}

export type TopicMsgCodec =
  | {
      t: 'json'
    }
  | {
      t: 'error'
      error: Error
    }

const initJson: ITopicMsgCodec = {
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

const initError: ITopicMsgCodec = {
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

const init = (config: TopicMsgCodec): ITopicMsgCodec => {
  switch (config.t) {
    case 'json':
      return initJson
    case 'error':
      return initError
  }
}

export const TopicMsgCodec = {
  init,
}
