export type IWebClient = {
  fetch: (request: Request) => Promise<Response>
}
