export type ICompress = {
  gzipSync: (data: Uint8Array | string | ArrayBuffer) => Uint8Array<ArrayBufferLike>
  gzipReadableStream: (
    stream: ReadableStream<ArrayBufferView | ArrayBufferLike>,
  ) => Promise<Uint8Array<ArrayBufferLike>>
  gzipResponse: (response: Response) => Promise<Response>
}
