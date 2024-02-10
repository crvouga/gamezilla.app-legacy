import { Result } from "../data/result"
import { Eff } from "../eff"
import { PubSub, Sub } from "../sub"
import { Task } from "../task"

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
  locationSub.publish(getLocation())
}
if (typeof window !== "undefined") {
  window.addEventListener("popstate", handler)
}

export const onLocation = <Msg>(fn: (location: Location) => Msg): Sub<Msg> => {
  return Sub.map(locationSub, fn)
}

export const getLocation = (): Location => {
  return {
    pathname: window.location.pathname,
    query: Object.fromEntries(
      new URLSearchParams(window.location.search).entries(),
    ),
  }
}

// setTimeout because actions where happening in a weird order if not setTimeout

export const push = (url: string): Eff => {
  return () => {
    setTimeout(() => {
      window.history.pushState(null, "", url)
      window.dispatchEvent(new Event("popstate"))
    }, 0)
  }
}

export const replace = (url: string): Eff => {
  return () => {
    setTimeout(() => {
      window.history.replaceState(null, "", url)
      window.dispatchEvent(new Event("popstate"))
    }, 0)
  }
}

export const back: Eff = () => {
  setTimeout(() => {
    window.history.back()
    window.dispatchEvent(new Event("popstate"))
  }, 0)
}

//
//
//
// Dom
//
//
//

export type Problem = { type: "ElementNotFound" }

export type FocusResult = Result<Problem, null>

export const focus =
  (htmlId: string, timeout?: number): Task<FocusResult> =>
  async () => {
    await new Promise((resolve) => setTimeout(resolve, timeout))

    const element = document.getElementById(htmlId)

    if (element) {
      element.focus()
      return Result.ok(null)
    }

    return Result.err({ type: "ElementNotFound" })
  }

export type ScrollResult = Result<Problem, null>

export const scrollIntoView =
  (htmlId: string): Task<ScrollResult> =>
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))

    const element = document.getElementById(htmlId)

    if (element) {
      element.scrollIntoView({
        behavior: "auto",
        // block: 'center',
        inline: "center",
      })

      return Result.ok(null)
    }

    return Result.err({ type: "ElementNotFound" })
  }

export type GetElementByIdResult = Result<Problem, DomElement>

export type DomElement = {
  offsetHeight: number
  offsetWidth: number
}

export const getElementById =
  (htmlId: string): Task<GetElementByIdResult> =>
  async () => {
    const element = document.getElementById(htmlId)

    if (element) {
      return Result.ok({
        offsetHeight: element.offsetHeight,
        offsetWidth: element.offsetWidth,
      })
    }

    return Result.err({ type: "ElementNotFound" })
  }

type VisibilityState = "visible" | "hidden"

const documentVisibilityState = PubSub.create<VisibilityState>()

export const onDocumentVisibilityState = <T>(
  fn: (state: VisibilityState) => T,
) => {
  return Sub.map(documentVisibilityState, fn)
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    documentVisibilityState.publish(document.visibilityState)
  })
}

export const getDocumentVisibilityState = (): VisibilityState => {
  if (typeof document === "undefined") {
    return "visible"
  }
  return document.visibilityState
}
