import { minBy } from '../array/min-by'
import { TranslatedText } from '../l18n'
import { editDistance } from '../string/edit-distance'

const ALL = ['inferno', 'preact', 'react', 'snabbdom'] as const

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

const readFromUrl = (config: { fallback: VDomImpl }): VDomImpl => {
  if (typeof window === 'undefined') return config.fallback
  const searchParams = new URLSearchParams(window.location.search)
  const vdomImplParam = searchParams.get('vdom')
  const vdomImpl = VDomImpl.from(vdomImplParam)
  return vdomImpl ?? config.fallback
}

const toName = (impl: VDomImpl): TranslatedText => {
  switch (impl) {
    case 'inferno':
      return TranslatedText.of('Inferno')
    case 'preact':
      return TranslatedText.of('Preact')
    case 'react':
      return TranslatedText.of('React')
    case 'snabbdom':
      return TranslatedText.of('Snabbdom')
  }
}

export const VDomImpl = {
  ALL,
  from,
  of,
  readFromUrl,
  toName,
}
