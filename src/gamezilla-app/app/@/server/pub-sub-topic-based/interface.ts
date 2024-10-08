export type IPubSubTopicBased<TMsg> = {
  sub: (topic: string, callback: (msg: TMsg) => void) => Promise<() => Promise<void>>
  pub: (topic: string, msg: TMsg) => Promise<void>
  unsub: (topic: string) => Promise<void>
}
