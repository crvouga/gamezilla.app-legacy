import { minBy } from '../array/min-by'
import { editDistance } from '../string/edit-distance'

const ALL = ['inferno', 'preact', 'react', 'react-with-compiler'] as const

export type VDomImpl = (typeof ALL)[number]

const of = (impl: VDomImpl): VDomImpl => {
  return impl
}

const from = (s: unknown): VDomImpl | null => {
  if (typeof s !== 'string') {
    return null
  }

  const found = minBy(Array.from(ALL), (x) => editDistance(x, s)) ?? null

  return found
}

export const VDomImpl = {
  ALL,
  from,
  of,
}
