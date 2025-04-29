import type { Eff } from '../eff'
import type { IO } from '../io'
import { sleep } from '../promise/sleep'
import { Result } from '../result'
import { PubSub, Sub } from '../sub'
import { TimeSpan } from '../time/time-span'

//
//
//
// History
//
//
//

export type Location = {
  pathname: string
  query: { [key: string]: string }
}

const locationSub = PubSub.create<Location>()
const handler = () => {
  locationSub.pub(location())
}
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', handler)
}

export const onLocation = <Msg>(fn: (location: Location) => Msg): Sub<Msg> => {
  return Sub.map(locationSub, fn)
}

export const location = (): Location => {
  if (typeof window === 'undefined') {
    return {
      pathname: '',
      query: {},
    }
  }
  return {
    pathname: window.location.pathname,
    query: Object.fromEntries(new URLSearchParams(window.location.search).entries()),
  }
}

// setTimeout because actions where happening in a weird order if not setTimeout

export const push = (url: string): Eff => {
  return () => {
    setTimeout(() => {
      window.history.pushState(null, '', url)
      window.dispatchEvent(new Event('popstate'))
    }, 0)
  }
}

export const pushQueryParam = (key: string, value: string): Eff => {
  return () => {
    setTimeout(() => {
      try {
        const url = new URL(window.location.href)
        url.searchParams.set(key, value)
        window.history.pushState(null, '', url.toString())
        window.dispatchEvent(new Event('popstate'))
      } catch (e) {
        console.error(e)
      }
    }, 0)
  }
}

export const replaceQueryParam = (key: string, value: string): Eff => {
  return () => {
    setTimeout(() => {
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set(key, value)
      window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`)
      window.dispatchEvent(new Event('popstate'))
    }, 0)
  }
}

export const replace = (url: string): Eff => {
  return () => {
    setTimeout(() => {
      window.history.replaceState(null, '', url)
      window.dispatchEvent(new Event('popstate'))
    }, 0)
  }
}

export const back: Eff = () => {
  setTimeout(() => {
    window.history.back()
    window.dispatchEvent(new Event('popstate'))
  }, 0)
}

type State = {
  entries: PubSub<IntersectionObserverEntry>
  observer: IntersectionObserver
}

const stateByHtmlId = new Map<string, State>()

export const onIntersections = <T>(htmlId: string, mapper: (entry: IntersectionObserverEntry) => T): Sub<T> => {
  const state = stateByHtmlId.get(htmlId)

  if (state) {
    return Sub.map(state.entries, mapper)
  }

  const element = document.getElementById(htmlId)

  if (!element) {
    return Sub.None
  }

  const pubSub = PubSub.create<IntersectionObserverEntry>()

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      pubSub.pub(entry)
    }
  })

  observer.observe(element)

  stateByHtmlId.set(htmlId, { entries: pubSub, observer })

  return {
    sub(subscriber) {
      const unsub = pubSub.sub((msg) => {
        subscriber(mapper(msg))
      })
      return () => {
        unsub()
        observer.disconnect()
      }
    },
  }
}

//
//
//
// Dom
//
//
//

export type Problem = { type: 'ElementNotFound' }

export type FocusResult = Result<Problem, null>

export const focus =
  (htmlId: string, timeout?: number): IO<FocusResult> =>
  async () => {
    await sleep(TimeSpan.milliseconds(timeout ?? 0))

    const element = document.getElementById(htmlId)

    if (element) {
      element.focus()
      return Result.Ok(null)
    }

    return Result.Err({
      type: 'ElementNotFound',
    })
  }

export type ScrollResult = Result<Problem, null>

export const scrollIntoView =
  (htmlId: string): IO<ScrollResult> =>
  async () => {
    await sleep(TimeSpan.milliseconds(0))

    const element = document.getElementById(htmlId)

    if (element) {
      element.scrollIntoView({
        behavior: 'auto',
        // block: 'center',
        inline: 'center',
      })

      return Result.Ok(null)
    }

    return Result.Err({
      type: 'ElementNotFound',
    })
  }

export type GetElementByIdResult = Result<Problem, DomElement>

export type DomElement = {
  offsetHeight: number
  offsetWidth: number
}

export const getElementById =
  (htmlId: string): IO<GetElementByIdResult> =>
  async () => {
    const element = document.getElementById(htmlId)

    if (element) {
      return Result.Ok({
        offsetHeight: element.offsetHeight,
        offsetWidth: element.offsetWidth,
      })
    }

    return Result.Err({
      type: 'ElementNotFound',
    })
  }

type VisibilityState = 'visible' | 'hidden'

const documentVisibilityState = PubSub.create<VisibilityState>()

export const onDocumentVisibilityState = <T>(fn: (state: VisibilityState) => T) => {
  return Sub.map(documentVisibilityState, fn)
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    documentVisibilityState.pub(document.visibilityState)
  })
}

export const getDocumentVisibilityState = (): VisibilityState => {
  if (typeof document === 'undefined') {
    return 'visible'
  }
  return document.visibilityState
}

const windowWidth = PubSub.create<{ width: number }>()

export const onWindowResize = <T>(fn: (input: { width: number }) => T): Sub<T> => {
  return Sub.map(windowWidth, fn)
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'resize',
    () => {
      windowWidth.pub({ width: window.innerWidth })
    },
    {
      passive: true,
    },
  )
}

export const getWindowWidth = (): number => {
  if (typeof window === 'undefined') {
    return 0
  }
  return window.innerWidth
}
