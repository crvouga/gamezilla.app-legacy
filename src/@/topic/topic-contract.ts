import { s } from '~/@/schema'

export type TopicContractItem<TParams, TMsg> = {
  params: s.Schema<TParams>
  msg: s.Schema<TMsg>
}

export type TopicContractBase = {
  [key: string]: TopicContractItem<any, any>
}

export type TopicContract<TTopics extends TopicContractBase> = TTopics

const init = <TTopics extends Record<string, TopicContractItem<any, any>>>(topics: TTopics): TopicContract<TTopics> =>
  topics

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type Base = Record<string, TopicContractItem<any, any>>

export function combine<A extends Base>(contracts: [A]): TopicContract<Prettify<A>>
export function combine<A extends Base, B extends Base>(contracts: [A, B]): TopicContract<Prettify<A & B>>
export function combine<A extends Base, B extends Base, C extends Base>(
  contracts: [A, B, C],
): TopicContract<Prettify<A & B & C>>
export function combine<A extends Base, B extends Base, C extends Base, D extends Base>(
  contracts: [A, B, C, D],
): TopicContract<Prettify<A & B & C & D>>
export function combine<A extends Base, B extends Base, C extends Base, D extends Base, E extends Base>(
  contracts: [A, B, C, D, E],
): TopicContract<Prettify<A & B & C & D & E>>
export function combine<A extends Base, B extends Base, C extends Base, D extends Base, E extends Base, F extends Base>(
  contracts: [A, B, C, D, E, F],
): TopicContract<Prettify<A & B & C & D & E & F>>
export function combine<
  A extends Base,
  B extends Base,
  C extends Base,
  D extends Base,
  E extends Base,
  F extends Base,
  G extends Base,
>(contracts: [A, B, C, D, E, F, G]): TopicContract<Prettify<A & B & C & D & E & F & G>>
export function combine<
  A extends Base,
  B extends Base,
  C extends Base,
  D extends Base,
  E extends Base,
  F extends Base,
  G extends Base,
  H extends Base,
>(contracts: [A, B, C, D, E, F, G, H]): TopicContract<Prettify<A & B & C & D & E & F & G & H>>
export function combine<
  A extends Base,
  B extends Base,
  C extends Base,
  D extends Base,
  E extends Base,
  F extends Base,
  G extends Base,
  H extends Base,
  I extends Base,
>(contracts: [A, B, C, D, E, F, G, H, I]): TopicContract<Prettify<A & B & C & D & E & F & G & H & I>>
export function combine(contracts: Base[]): any {
  return contracts.reduce((acc, contract) => ({ ...acc, ...contract }), {})
}

export const TopicContract = {
  init,
  combine,
}
