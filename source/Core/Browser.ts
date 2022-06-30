import * as History from "history"
import * as Rx from "rxjs"
import * as Cmd from "./Cmd"
import * as Html from "./Html"
import * as Option from "./Option"
import * as Platform from "./Platform"
import * as Sub from "./Sub"

//
//
//
// Model
//
//
//

export type Program<Model, Msg, Dom> = Platform.Program<Model, Msg> & {
  html$: Rx.Observable<Html.Html<Dom, Msg>>
}

export type Renderer<Dom> = (dom: Dom) => void

//
//
//
// History
//
//
//

export type Location = History.Location

export const history = History.createBrowserHistory()

export const location$ = new Rx.Subject<Location>()

history.listen((historyUpdate) => {
  location$.next(historyUpdate.location)
})

//
//
//
// Navigation
//
//
//

export const reload: Cmd.Cmd<never> = Rx.of(async () => {
  window.location.reload()

  return Option.None
})

export const push = (url: string): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    history.push(url)

    return Option.None
  })
}

export const replace = (url: string): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    history.replace(url)

    return Option.None
  })
}

export const back: Cmd.Cmd<never> = Rx.of(async () => {
  history.back()

  return Option.None
})

//
//
//
// Program
//
//
//

export const Application = <Model, Msg, Dom>({
  onLocationChange,
  init,
  update,
  view,
  subscriptions,
}: {
  onLocationChange: (location: Location) => Msg
  init: (location: Location) => [Model, Cmd.Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  view: (model: Model) => Html.Html<Dom, Msg>
  subscriptions: (model: Model) => Sub.Sub<Msg>
}): Program<Model, Msg, Dom> => {
  const onChangeLocation$ = location$.pipe(
    Rx.map((location) => onLocationChange(location)),
  )

  const subs = (model: Model): Sub.Sub<Msg> =>
    Sub.batch([subscriptions(model), onChangeLocation$])

  return Element({
    init: init(history.location),
    update,
    view,
    subscriptions: subs,
  })
}

export const Element = <Model, Msg, Dom>({
  init,
  view,
  update,
  subscriptions,
}: {
  init: [Model, Cmd.Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  view: (model: Model) => Html.Html<Dom, Msg>
  subscriptions: (model: Model) => Sub.Sub<Msg>
}): Program<Model, Msg, Dom> => {
  const program = Platform.Worker({
    init,
    update,
    subscriptions,
  })

  const html$ = program.model$.pipe(Rx.map(view))

  return {
    ...program,
    html$,
  }
}

export const withStop =
  (signal: Rx.Subject<unknown>) =>
  <Model, Msg, Dom>(
    program: Program<Model, Msg, Dom>,
  ): Program<Model, Msg, Dom> => {
    const { html$, ...rest } = program

    return {
      ...Platform.withStop(signal)(rest),
      html$: html$.pipe(Rx.takeUntil(signal)),
    }
  }

export const run = <Model, Msg, Dom>(
  program: Program<Model, Msg, Dom>,
  renderer: Renderer<Dom>,
): Rx.Observable<Model> => {
  const { dispatch, html$ } = program

  html$.subscribe((html) => renderer(html(dispatch)))

  return Platform.run(program)
}
