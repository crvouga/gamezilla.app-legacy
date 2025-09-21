export type IHttpClient = {
  send: (request: Request) => Promise<Response>
}
