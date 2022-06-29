import * as Rx from "rxjs"
import * as Cmd from "./Cmd"
import * as Platform from "./Platform"
import * as Sub from "./Sub"

export type Html<Dom, Msg> = (dispatch: Platform.Dispatch<Msg>) => Dom

export interface Renderer<Dom> {
  (dom: Dom): void
}

export type Program<Model, Msg, Dom> = Platform.Program<Model, Msg> & {
  html$: Rx.Observable<Html<Dom, Msg>>
}

export const map =
  <Dom, A, Msg>(f: (a: A) => Msg) =>
  (htmlA: Html<Dom, A>): Html<Dom, Msg> =>
  (dispatch) =>
    htmlA((a) => dispatch(f(a)))

export const Program = <Model, Msg, Dom>({
  init,
  view,
  update,
  subscriptions,
}: {
  init: [Model, Cmd.Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  view: (model: Model) => Html<Dom, Msg>
  subscriptions: (model: Model) => Sub.Sub<Msg>
}): Program<Model, Msg, Dom> => {
  const { dispatch, cmd$, sub$, model$ } = Platform.Program({
    init,
    update,
    subscriptions,
  })

  const html$ = model$.pipe(Rx.map(view))

  return {
    dispatch,
    cmd$,
    sub$,
    model$,
    html$,
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
