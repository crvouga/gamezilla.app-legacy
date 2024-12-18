export const ALL_VDOM_IMPLS = ['inferno', 'preact', 'react', 'react-with-compiler'] as const

export type VDomImpl = (typeof ALL_VDOM_IMPLS)[number]
