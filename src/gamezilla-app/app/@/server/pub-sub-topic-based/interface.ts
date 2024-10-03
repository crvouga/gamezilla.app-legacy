export type IPubSubTopicBased<TMsg> = {
  sub: (topic: string, callback: (msg: TMsg) => void) => () => void
  pub: (topic: string, msg: TMsg) => void
}
