import { Sub } from '../sub'

export type ViewportVisibility = 'visible' | 'hidden'

export type ViewportSize = {
  width: number
  height: number
}

export type IViewport = {
  visibility: {
    get: () => ViewportVisibility
    sub: <TMsg>(fn: (state: ViewportVisibility) => TMsg) => Sub<TMsg>
  }
  size: {
    get: () => ViewportSize
    sub: <TMsg>(fn: (size: ViewportSize) => TMsg) => Sub<TMsg>
  }
}
