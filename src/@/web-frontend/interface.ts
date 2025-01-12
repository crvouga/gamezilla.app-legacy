export type IWebFrontend = {
  fetch: (request: Request) => Promise<Response>
}
