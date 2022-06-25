import * as History from "history"
import * as Rx from "rxjs"
import { option } from "fp-ts"
import * as Cmd from "./Cmd"
import * as Sub from "./Sub"

//
//
//
// Model
//
//
//

export type Location = History.Location

//
//
//
// History
//
//
//

const history = History.createBrowserHistory()

//
//
//
// Subscriptions
//
//
//

const location$ = new Rx.Subject<Location>()

history.listen((location) => {
  location$.next(location.location)
})

export const getLocation = () => {
  return history.location
}

export const subscription: Sub.Sub<Location> = location$

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

    return option.none
  })
}

export const push = <Msg>(url: string): Cmd.Cmd<Msg> => {
  return Rx.of(async () => {
    history.push(url)

    return option.none
  })
}

export const replace = <Msg>(url: string): Cmd.Cmd<Msg> => {
  return Rx.of(async () => {
    history.replace(url)

    return option.none
  })
}

export const back = <Msg>(): Cmd.Cmd<Msg> => {
  return Rx.of(async () => {
    history.back()

    return option.none
  })
}
