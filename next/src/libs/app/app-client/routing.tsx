import { AppMsg, Route } from '@gamezilla/shared/client';
import { Browser, Cmd, p } from '@gamezilla/shared/core';

//
//
//
// Model
//
//
//

export type Model = {
  route: Route;
};

const fallback: Route = { t: 'room', c: { t: 'room-list' } };

export const init = (
  location: Browser.Location
): { model: Model; cmd: Cmd } => {
  const route = p(
    location.pathname,
    Route.decode,
    (route): Route => (route ? route : fallback)
  );

  return {
    model: { route },
    cmd: Route.replace(route),
  };
};

//
//
//
// Update
//
//
//

export type Msg =
  | { t: 'route-changed'; c: Route }
  | { t: 'clicked-link'; c: Route }
  | { t: 'clicked-back' };

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: AppMsg[];
} => {
  if (msg.t === 'clicked-back') {
    return { model, cmd: Route.back };
  }

  if (msg.t === 'clicked-link') {
    return { model, cmd: Route.push(msg.c) };
  }

  if (msg.t === 'route-changed') {
    return {
      model: { route: msg.c },
      msgs: [{ t: 'route-changed', route: msg.c }],
    };
  }

  return { model };
};

//
//
//
// Subscriptions
//
//
//

const onLocationChange = (location: Browser.Location): Msg => {
  return p(
    location.pathname,
    Route.decode,
    (route): Route => (route ? route : fallback),
    (route): Msg => ({ t: 'route-changed', c: route })
  );
};

export const subscriptions = Browser.onLocation(onLocationChange);
