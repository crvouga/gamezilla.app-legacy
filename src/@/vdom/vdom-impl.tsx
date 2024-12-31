export const ALL_VDOM_IMPLS = ['inferno', 'preact', 'react', 'react-with-compiler'] as const

export type VDomImpl = (typeof ALL_VDOM_IMPLS)[number]

const of = (impl: VDomImpl): VDomImpl => impl

const fromString = (s: unknown): VDomImpl | null => {
  if (typeof s !== 'string') {
    return null
  }

  if (ALL_VDOM_IMPLS.includes(s as VDomImpl)) {
    return s as VDomImpl
  }

  return null
}

export const VDomImpl = {
  fromString,
  of
}
