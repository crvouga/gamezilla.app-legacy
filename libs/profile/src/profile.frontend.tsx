import { Sub } from '@gamezilla/core';
import { SharedMsg } from '@gamezilla/shared';
import { FrontendModel, FrontendMsg, ToFrontend } from './profile.types';

//
//
//
// model
//
//
//

export type Model = FrontendModel;

export const init: Model = {
  profiles: {},
  requests: {},
};

//
//
//
// update
//
//
//

export type Msg = FrontendMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model } => {
  switch (msg[0]) {
    default: {
      return { model };
    }
  }
};

export const updateFromBackend = ({
  msg,
  model,
}: {
  msg: ToFrontend;
  model: Model;
}): { model: Model } => {
  switch (msg[0]) {
    default: {
      return { model };
    }
  }
};

export const updateShared = ({
  msg,
  model,
}: {
  msg: SharedMsg;
  model: Model;
}) => {
  switch (msg[0]) {
    case 'route-changed': {
      const route = msg[1];
      if (route[0] !== 'profile') {
        return { model };
      }
      return { model };
    }

    default: {
      return { model };
    }
  }
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
//
// view
//
//
//

type RouteProfile = 'profile' | 'profile-update-username';

export const View = ({
  model,
  route,
}: {
  model: Model;
  route: RouteProfile;
}) => {
  switch (route) {
    case 'profile-update-username': {
      return <ViewPageProfileUpdateUsername />;
    }
  }
  return <pre>{JSON.stringify(model, null, 2)}</pre>;
};

const ViewPageProfileUpdateUsername = () => {
  return <pre>ViewPageProfileUpdateUsername</pre>;
};
