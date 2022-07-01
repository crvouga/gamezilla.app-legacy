import * as Platform from "./Platform";

export type Html<Dom, Msg> = (dispatch: Platform.Dispatch<Msg>) => Dom;

export const map =
  <Dom, A, Msg>(f: (a: A) => Msg) =>
  (htmlA: Html<Dom, A>): Html<Dom, Msg> =>
  (dispatch) =>
    htmlA((a) => dispatch(f(a)));
