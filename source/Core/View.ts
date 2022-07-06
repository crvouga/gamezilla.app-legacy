import * as Platform from "./Platform";

export type View<Dom, Msg> = (dispatch: Platform.Dispatch<Msg>) => Dom;

export const map =
  <Dom, A, Msg>(f: (a: A) => Msg) =>
  (htmlA: View<Dom, A>): View<Dom, Msg> =>
  (dispatch) =>
    htmlA((a) => dispatch(f(a)));
