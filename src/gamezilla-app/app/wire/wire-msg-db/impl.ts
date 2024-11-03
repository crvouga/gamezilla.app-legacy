import type { IWireMsgDb } from './interface'

export type Config = {}

export const WireMsgDb = <TMsg>(_config: Config): IWireMsgDb<TMsg> => {
  throw new Error('not implemented')
}
