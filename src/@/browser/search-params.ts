import { Eff } from '../eff'
import { PubSub, Sub } from '../sub'

const searchParams = PubSub.create<URLSearchParams>()

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    searchParams.pub(new URLSearchParams(window.location.search))
  })
  window.addEventListener('pushstate', () => {
    searchParams.pub(new URLSearchParams(window.location.search))
  })
}

const watch = <TMsg>(map: (params: URLSearchParams) => TMsg): Sub<TMsg> => {
  return Sub.map(searchParams, map)
}

const push =
  <TMsg>(params: URLSearchParams): Eff<TMsg> =>
  () => {
    window.history.pushState({}, '', `?${params.toString()}`)
    searchParams.pub(params)
  }

export const SearchParams = {
  push,
  watch,
}
