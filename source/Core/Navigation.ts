import * as History from "history"
import * as Rx from "rxjs"
import * as Cmd from "./Cmd"
import * as Html from "./Html"
import * as Option from "./Option"
import * as Sub from "./Sub"

//
//
//
// History
//
//
//

export type Location = History.Location

const history = History.createBrowserHistory()

export const location$ = new Rx.Subject<Location>()

history.listen((location) => {
  location$.next(location.location)
})

export const getLocation = (): Location => {
  return history.location
}

//
//
//
// Cmd
//
//
//

export const reload = <Msg>(): Cmd.Cmd<Msg> => {
  return Rx.of(async () => {
    window.location.reload()

    return Option.None
  })
}

export const push = <Msg>(url: string): Cmd.Cmd<Msg> => {
  return Rx.of(async () => {
    history.push(url)

    return Option.None
  })
}

export const replace = <Msg>(url: string): Cmd.Cmd<Msg> => {
  return Rx.of(async () => {
    history.replace(url)

    return Option.None
  })
}

export const back = <Msg>(): Cmd.Cmd<Msg> => {
  return Rx.of(async () => {
    history.back()

    return Option.None
  })
}

//
//
//
// Subscription
//
//
//

export const subscription: Sub.Sub<Location> = location$

/**
 * Returns a `Program` specialized for `Navigation`.
 *
 * The `Program` is a `Html.Program` but it needs a `locationToMsg()` function which converts location changes to messages.
 *
 * Underneath it consumes `location$` stream (applying `locationToMsg()` on its values).
 * @category constructors
 * @since 0.5.0
 */
export const Program = <Model, Msg, Dom>(
  locationToMessage: (location: Location) => Msg,
  init: (location: Location) => [Model, Cmd.Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>],
  view: (model: Model) => Html.Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub.Sub<Msg>,
): Html.Program<Model, Msg, Dom> => {
  const onChangeLocation$ = location$.pipe(
    Rx.map((location) => locationToMessage(location)),
  )

  const subs = (model: Model): Sub.Sub<Msg> =>
    Sub.batch([subscriptions(model), onChangeLocation$])

  return Html.Program(init(history.location), update, view, subs)
}
