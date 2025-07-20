import { s } from '~/@/schema'
import { combineContracts } from './combine-contracts'

export type TopicContractItem<TParams, TMsg> = {
  params: s.Schema<TParams>
  msg: s.Schema<TMsg>
}

export type ContractBase = {
  [key: string]: TopicContractItem<any, any>
}

export type Contract<TTopics extends ContractBase> = TTopics

const init = <TTopics extends Record<string, TopicContractItem<any, any>>>(topics: TTopics): Contract<TTopics> => topics

export const TopicContract = {
  init,
  combine: combineContracts,
}
