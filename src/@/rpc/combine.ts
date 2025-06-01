import { Base, Contract } from './types'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export function combineContracts<A extends Base>(contracts: [A]): Contract<Prettify<A>>
export function combineContracts<A extends Base, B extends Base>(contracts: [A, B]): Contract<Prettify<A & B>>
export function combineContracts<A extends Base, B extends Base, C extends Base>(
  contracts: [A, B, C],
): Contract<Prettify<A & B & C>>
export function combineContracts<A extends Base, B extends Base, C extends Base, D extends Base>(
  contracts: [A, B, C, D],
): Contract<Prettify<A & B & C & D>>
export function combineContracts<A extends Base, B extends Base, C extends Base, D extends Base, E extends Base>(
  contracts: [A, B, C, D, E],
): Contract<Prettify<A & B & C & D & E>>
export function combineContracts<
  A extends Base,
  B extends Base,
  C extends Base,
  D extends Base,
  E extends Base,
  F extends Base,
>(contracts: [A, B, C, D, E, F]): Contract<Prettify<A & B & C & D & E & F>>
export function combineContracts<
  A extends Base,
  B extends Base,
  C extends Base,
  D extends Base,
  E extends Base,
  F extends Base,
  G extends Base,
>(contracts: [A, B, C, D, E, F, G]): Contract<Prettify<A & B & C & D & E & F & G>>
export function combineContracts<
  A extends Base,
  B extends Base,
  C extends Base,
  D extends Base,
  E extends Base,
  F extends Base,
  G extends Base,
  H extends Base,
>(contracts: [A, B, C, D, E, F, G, H]): Contract<Prettify<A & B & C & D & E & F & G & H>>
export function combineContracts<
  A extends Base,
  B extends Base,
  C extends Base,
  D extends Base,
  E extends Base,
  F extends Base,
  G extends Base,
  H extends Base,
  I extends Base,
>(contracts: [A, B, C, D, E, F, G, H, I]): Contract<Prettify<A & B & C & D & E & F & G & H & I>>
export function combineContracts(contracts: Base[]): any {
  return contracts.reduce((acc, contract) => ({ ...acc, ...contract }), {})
}
