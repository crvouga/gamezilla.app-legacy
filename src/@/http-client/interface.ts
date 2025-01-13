export type IHttpClient = {
  fetch: (request: Request) => Promise<Response>
}
