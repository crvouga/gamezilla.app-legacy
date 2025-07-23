import { minBy } from '../array/min-by'
import { TranslatedText } from '../l18n'
import { editDistance } from '../string/edit-distance'

const ALL = ['inferno', 'preact', 'react', 'snabbdom', 'react-native'] as const

const HIDDEN: VDomImpl[] = []

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

const SEARCH_PARAM_KEY = 'vdom'

const FALLBACK: VDomImpl = 'snabbdom'

const getUrl = (): VDomImpl => {
  if (typeof window === 'undefined') return FALLBACK
  const searchParams = new URLSearchParams(window.location.search)
  const vdomImplParam = searchParams.get(SEARCH_PARAM_KEY)
  const vdomImpl = VDomImpl.from(vdomImplParam)
  return vdomImpl ?? FALLBACK
}

const setUrl = (vdomImpl: VDomImpl) => {
  const searchParams = new URLSearchParams(window.location.search)
  searchParams.set(SEARCH_PARAM_KEY, vdomImpl)
  window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`)
  window.dispatchEvent(new Event('popstate'))
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
    case 'react-native':
      return TranslatedText.of('React Native')
  }
}

const VISIBLE = ALL.filter((vDomImpl) => !HIDDEN.includes(vDomImpl))

export const VDomImpl = {
  ALL,
  from,
  of,
  getUrl,
  setUrl,
  toName,
  HIDDEN,
  VISIBLE,
}
