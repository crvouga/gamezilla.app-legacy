export type ITopicBasedPubSub = {
  sub: (topic: string, callback: (msg: string) => unknown) => Promise<() => Promise<void>>
  pub: (topic: string, msg: string) => Promise<void>
  unsub: (topic: string) => Promise<void>
}
