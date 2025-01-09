import { minBy } from '../array/min-by'
import { editDistance } from '../string/edit-distance'

export const ALL_VDOM_IMPL = ['inferno', 'preact', 'react', 'react-with-compiler', 'vue'] as const

export type VDomImpl = (typeof ALL_VDOM_IMPL)[number]

const of = (impl: VDomImpl): VDomImpl => {
  return impl
}

const from = (s: unknown): VDomImpl | null => {
  if (typeof s !== 'string') {
    return null
  }

  const found = minBy(Array.from(ALL_VDOM_IMPL), (x) => editDistance(x, s)) ?? null

  return found
}

export const VDomImpl = {
  from,
  of,
}
