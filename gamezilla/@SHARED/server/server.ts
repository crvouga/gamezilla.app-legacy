export type IServer = {
  start: (port: number) => Promise<void>
}
