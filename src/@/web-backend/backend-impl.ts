export type BackendImpl = 'bun' | 'node'

const of = (impl: BackendImpl) => impl

export const BackendImpl = {
  of,
}
