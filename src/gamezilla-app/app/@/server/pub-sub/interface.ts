export type IPubSub = {
  pub: (msg: string) => void
  sub: (subscriber: (msg: string) => void) => Promise<() => void>
}
