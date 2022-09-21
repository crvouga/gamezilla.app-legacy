import * as Rx from "rxjs"
import * as Cmd from "../Cmd"
import * as Option from "../Option"
import * as Platform from "../Platform"
import * as Result from "../Result"
import * as Sub from "../Sub"
import * as Task from "../Task"
import * as View from "../View"

//
//
//
// Program
//
//
//

export type Program<Model, Msg, Dom> = Platform.Program<Model, Msg> & {
  view$: Rx.Observable<View.View<Dom, Msg>>
}

export type Renderer<Dom> = (dom: Dom) => void

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

export const onLocation = new Rx.Observable<Location>((subscriber) => {
  const handler = () => {
    subscriber.next(getLocation())
  }
  window.addEventListener("popstate", handler)
  return () => {
    window.removeEventListener("popstate", handler)
  }
})

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

export const push = (url: string): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    setTimeout(() => {
      window.history.pushState(null, "", url)
      window.dispatchEvent(new Event("popstate"))
    }, 0)
    return Option.None
  })
}

export const replace = (url: string): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    setTimeout(() => {
      window.history.replaceState(null, "", url)
      window.dispatchEvent(new Event("popstate"))
    }, 0)
    return Option.None
  })
}

export const back: Cmd.Cmd<never> = Rx.of(async () => {
  setTimeout(() => {
    window.history.back()
    window.dispatchEvent(new Event("popstate"))
  }, 0)
  return Option.None
})

//
//
//
// Dom
//
//
//

export type Problem = { type: "ElementNotFound" }

export type FocusResult = Result.Result<Problem, {}>

export const focus =
  (htmlId: string): Task.Task<FocusResult> =>
    async () => {
      const element = document.getElementById(htmlId)

      if (element) {
        element.focus()
        return Result.Ok({})
      }

      return Result.Err({ type: "ElementNotFound" })
    }

export type GetElementByIdResult = Result.Result<Problem, DomElement>

export type DomElement = {
  offsetHeight: number
  offsetWidth: number
}

export const getElementById =
  (htmlId: string): Task.Task<GetElementByIdResult> =>
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

export const onResize = <Msg>(
  mapper: (resize: Resize) => Msg,
): Sub.Sub<Msg> => {
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

//
//
//
// Program
//
//
//

export const application = <Model, Msg, Dom>({
  onLocationChange,
  init,
  update,
  view,
  subscriptions,
}: {
  onLocationChange: (location: Location) => Msg
  init: (location: Location) => [Model, Cmd.Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  view: (model: Model) => View.View<Dom, Msg>
  subscriptions: (model: Model) => Sub.Sub<Msg>
}): Program<Model, Msg, Dom> => {
  const onChangeLocation$ = onLocation.pipe(
    Rx.map((location) => onLocationChange(location)),
  )

  const subs = (model: Model): Sub.Sub<Msg> =>
    Sub.batch([subscriptions(model), onChangeLocation$])

  return element({
    init: init(getLocation()),
    update,
    view,
    subscriptions: subs,
  })
}

export const element = <Model, Msg, Dom>({
  init,
  view,
  update,
  subscriptions,
}: {
  init: [Model, Cmd.Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  view: (model: Model) => View.View<Dom, Msg>
  subscriptions: (model: Model) => Sub.Sub<Msg>
}): Program<Model, Msg, Dom> => {
  const program = Platform.worker({
    init,
    update,
    subscriptions,
  })

  const view$ = program.state$.pipe(Rx.map((state) => view(state.model)))

  return {
    ...program,
    view$: view$,
  }
}

export const run = <Model, Msg, Dom>(
  program: Program<Model, Msg, Dom>,
  renderer: Renderer<Dom>,
): (() => void) => {
  const { dispatch, view$ } = program

  const htmlSub = view$.subscribe((view) => renderer(view(dispatch)))

  const stop = Platform.run(program)

  return () => {
    htmlSub.unsubscribe()
    stop()
  }
}
