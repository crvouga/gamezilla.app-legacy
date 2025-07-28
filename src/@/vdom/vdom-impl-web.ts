import { minBy } from '../array/min-by'
import { TranslatedText } from '../l18n'
import { editDistance } from '../string/edit-distance'
import { Sub } from '../sub'

const ALL = ['inferno', 'preact', 'react', 'snabbdom'] as const

const HIDDEN: VDomImplWeb[] = []

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

const swapVDomEngine = Sub.init<VDomImplWeb>()

export const VDomImplWeb = {
  swapVDomEngine,
  ALL,
  from,
  of,
  toName,
  HIDDEN,
  VISIBLE,
}
