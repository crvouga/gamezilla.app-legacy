export type IPubSubTopicBased = {
  sub: (topic: string, callback: (msg: string) => void) => Promise<() => Promise<void>>
  pub: (topic: string, msg: string) => Promise<void>
  unsub: (topic: string) => Promise<void>
}
