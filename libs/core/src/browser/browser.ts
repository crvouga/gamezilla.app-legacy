import * as Rx from "rxjs"
import { Cmd } from "../cmd"
import { p } from "../pipe"
import { Result } from "../result"
import { Sub } from "../sub"
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

const location$ = new Rx.Observable<Location>((subscriber) => {
  const handler = () => {
    subscriber.next(getLocation())
  }
  window.addEventListener("popstate", handler)
  return () => {
    window.removeEventListener("popstate", handler)
  }
})

export const onLocation = <Msg>(
  mapper: (location: Location) => Msg,
): Sub<Msg> => {
  return p(location$, Sub.map(mapper))
}

export const getLocation = (): Location => {
  return {
    pathname: window.location.pathname,
    query: Object.fromEntries(
      new URLSearchParams(window.location.search).entries(),
    ),
  }
}

//
//
//
// Navigation
//
//
//

// setTimeout because actions where happening in a weird order if not setTimeout

export const push = (url: string): Cmd => {
  return () => {
    setTimeout(() => {
      window.history.pushState(null, "", url)
      window.dispatchEvent(new Event("popstate"))
    }, 0)
  }
}

export const replace = (url: string): Cmd => {
  return () => {
    setTimeout(() => {
      window.history.replaceState(null, "", url)
      window.dispatchEvent(new Event("popstate"))
    }, 0)
  }
}

export const back: Cmd = () => {
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

export type FocusResult = Result<Problem, {}>

export const focus =
  (htmlId: string): Task<FocusResult> =>
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))

      const element = document.getElementById(htmlId)

      if (element) {
        element.focus()
        return Result.Ok({})
      }

      return Result.Err({ type: "ElementNotFound" })
    }

export const scrollIntoView =
  (htmlId: string): Task<FocusResult> =>
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))

      const element = document.getElementById(htmlId)

      if (element) {
        element.scrollIntoView({ behavior: "auto" })

        return Result.Ok({})
      }

      return Result.Err({ type: "ElementNotFound" })
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
        return Result.Ok({
          offsetHeight: element.offsetHeight,
          offsetWidth: element.offsetWidth,
        })
      }

      return Result.Err({ type: "ElementNotFound" })
    }

export type Resize = {
  width: number
  height: number
}

export const onResize = <Msg>(mapper: (resize: Resize) => Msg): Sub<Msg> => {
  return new Rx.Observable((subscriber) => {
    const handle = () => {
      subscriber.next(
        mapper({
          height: window.innerHeight,
          width: window.innerWidth,
        }),
      )
    }

    window.addEventListener("resize", handle)

    return () => {
      window.removeEventListener("resize", handle)
    }
  })
}
