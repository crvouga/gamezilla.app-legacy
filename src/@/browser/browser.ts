import type { IO } from '../io'
import { sleep } from '../promise/sleep'
import { Result } from '../result'
import { Sub } from '../sub'
import { TimeSpan } from '../time/time-span'

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

const documentVisibilityState = Sub.create<VisibilityState>()

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

const windowWidth = Sub.create<{ width: number }>()

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
