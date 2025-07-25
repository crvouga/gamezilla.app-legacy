import { minBy } from '../array/min-by'
import { TranslatedText } from '../l18n'
import { editDistance } from '../string/edit-distance'
import { Sub } from '../sub'

const ALL = ['inferno', 'preact', 'react', 'snabbdom'] as const

const HIDDEN: VDomImplWeb[] = ['preact']

export type VDomImplWeb = (typeof ALL)[number]

const of = (impl: VDomImplWeb): VDomImplWeb => {
  return impl
}

const from = (s: unknown): VDomImplWeb | null => {
  if (typeof s !== 'string') {
    return null
  }

  const found = minBy(Array.from(ALL), (x) => editDistance(x, s)) ?? null

  return found
}

const SEARCH_PARAM_KEY = 'vdom'

const FALLBACK: VDomImplWeb = 'inferno'

const getUrl = (): VDomImplWeb => {
  if (typeof window === 'undefined') return FALLBACK
  const searchParams = new URLSearchParams(window.location.search)
  const vdomImplParam = searchParams.get(SEARCH_PARAM_KEY)
  const vdomImpl = VDomImplWeb.from(vdomImplParam)
  return vdomImpl ?? FALLBACK
}

const setUrl = (vdomImpl: VDomImplWeb) => {
  const searchParams = new URLSearchParams(window.location.search)
  searchParams.set(SEARCH_PARAM_KEY, vdomImpl)
  window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`)
  window.dispatchEvent(new Event('popstate'))
}

const toName = (impl: VDomImplWeb): TranslatedText => {
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

const VISIBLE = ALL.filter((vDomImpl) => !HIDDEN.includes(vDomImpl))

const events = Sub.create<{ t: 'changed-vdom-impl'; vdomImpl: VDomImplWeb }>()

export const VDomImplWeb = {
  events,
  ALL,
  from,
  of,
  getUrl,
  setUrl,
  toName,
  HIDDEN,
  VISIBLE,
}
