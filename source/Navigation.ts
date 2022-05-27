import { option } from "fp-ts";
import { Cmd } from "Framework/Cmd";
import { Sub } from "Framework/Sub";
import * as History from "history";
import * as Rx from "rxjs";

//
//
//
// Model
//
//
//

export type Location = History.Location;

//
//
//
// History
//
//
//

const history = History.createBrowserHistory();

//
//
//
// Subscriptions
//
//
//

const location$ = new Rx.Subject<Location>();

history.listen((location) => {
  location$.next(location.location);
});

export const getLocation = () => {
  return history.location;
};

export const subscription: Sub<Location> = location$;

//
//
//
// Cmd
//
//
//

export const reload = <Msg>(): Cmd<Msg> => {
  return Rx.of(async () => {
    window.location.reload();

    return option.none;
  });
};

export const push = <Msg>(url: string): Cmd<Msg> => {
  return Rx.of(async () => {
    history.push(url);

    return option.none;
  });
};

export const replace = <Msg>(url: string): Cmd<Msg> => {
  return Rx.of(async () => {
    history.replace(url);

    return option.none;
  });
};

export const back = <Msg>(): Cmd<Msg> => {
  return Rx.of(async () => {
    history.back();

    return option.none;
  });
};
