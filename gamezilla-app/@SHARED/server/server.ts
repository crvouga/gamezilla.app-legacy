export type IServer = {
  start: (port: number) => Promise<void>
  serveSinglePageApp: (input: { directory: string; file: string }) => void
}
