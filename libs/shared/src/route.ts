import { Browser, Cmd, Option } from '@gamezilla/core';
import { Iso3166Alpha2Code, PhoneNumber, RoomId, UserId } from './data';
const { Some } = Option;

//
//
//
// Model
//
//
//

export type Model =
  | ['account']
  | ['login']
  | ['login-email-link']
  | ['login-phone', { isSelectingCountry: boolean }]
  | ['login-phone-verify', { phoneNumber: PhoneNumber }]
  | ['logout']
  | ['profile', { userId: UserId }]
  | ['profile-create']
  | ['profile-delete']
  | ['profile-update']
  | ['profile-update-avatar']
  | ['profile-update-name']
  | ['profile-update-username']
  | ['profile-update-theme']
  | ['room', RoomId]
  | ['room-list']
  | ['party']
  | ['chat']
  | ['chat-new']
  | ['chat-conversation', { conversationId: string }]
  | ['search'];

//
//
//
// Encode/Decode
//
//
//

export const routesTypes: { [routeType in Model[0]]: string } = {
  ['account']: 'account',
  ['login']: 'login',
  ['login-email-link']: 'login-email-link',
  ['login-phone']: 'login-phone',
  ['login-phone-verify']: 'login-phone-verify',
  ['logout']: 'logout',
  ['profile']: 'profile',
  ['profile-create']: 'profile-create',
  ['profile-delete']: 'profile-delete',
  ['profile-update']: 'profile-update',
  ['profile-update-avatar']: 'profile-update-avatar',
  ['profile-update-name']: 'profile-update-name',
  ['profile-update-username']: 'profile-update-username',
  ['profile-update-theme']: 'profile-update-theme',
  ['room']: 'room',
  ['party']: 'party',
  ['chat']: 'chat',
  ['chat-new']: 'chat-new',
  ['chat-conversation']: 'chat-conversation',
  ['search']: 'search',
  ['room-list']: 'room-list',
};

export const isRouteType = (routeType: unknown): routeType is Model[0] => {
  return typeof routeType === 'string' && routeType in routesTypes;
};

export const decode = ({
  pathname,
  query,
}: Browser.Location): Option<Model> => {
  const [first, second] = pathname.substring(1).split('/');

  if (!isRouteType(first)) {
    return Option.None;
  }

  switch (first) {
    case 'chat-conversation': {
      if (typeof second === 'string') {
        return Some(['chat-conversation', { conversationId: second }]);
      }

      return Option.None;
    }

    case 'profile': {
      const userId = UserId.decode(second);

      if (userId.type === 'Ok') {
        return Some(['profile', { userId: userId.value }]);
      }

      return Option.None;
    }

    case 'login-phone': {
      const isSelectingCountry = query['isSelectingCountry'] === 'true';
      return Some(['login-phone', { isSelectingCountry }]);
    }

    case 'login-phone-verify': {
      const phoneNumberDirty = query['phoneNumber'];
      const country = query['country'];

      if (!phoneNumberDirty) {
        return Option.None;
      }

      if (!Iso3166Alpha2Code.is(country)) {
        return Option.None;
      }

      const decoded = PhoneNumber.decode(country, phoneNumberDirty);

      if (decoded.type === 'Err') {
        return Option.None;
      }

      const phoneNumber = decoded.value;

      return Some(['login-phone-verify', { phoneNumber: phoneNumber }]);
    }

    case 'room': {
      if (!second) {
        return Option.None;
      }

      const decoded = RoomId.decode(second);

      if (decoded.type === 'Err') {
        return Option.None;
      }

      const roomId = decoded.value;

      return Some([first, roomId]);
    }

    default: {
      return Some([first]);
    }
  }
};

export const encode = (route: Model): string => {
  switch (route[0]) {
    case 'chat-conversation':
      return `/${route[0]}/${route[1].conversationId}`;

    case 'profile':
      return `/${route[0]}/${route[1].userId}`;

    case 'login-phone': {
      const params = new URLSearchParams({
        isSelectingCountry: route[1].isSelectingCountry.toString(),
      });
      return `/${route[0]}?${params.toString()}`;
    }

    case 'login-phone-verify': {
      const phoneNumber = PhoneNumber.toString(route[1].phoneNumber);
      const country = PhoneNumber.toCountry(route[1].phoneNumber);
      const params = new URLSearchParams({ phoneNumber, country });
      return `/${route[0]}?${params.toString()}`;
    }
    case 'room': {
      return `/${route[0]}/${route[1]}`;
    }

    default:
      return `/${route[0]}`;
  }
};

//
//
//
// Cmd
//
//
//

export const push = (route: Model) => {
  return Browser.push(encode(route));
};

export const back = Browser.back;

export const replace = (route: Model) => {
  return Browser.replace(encode(route));
};

//
//
//
// Update
//
//
//

export type Msg = ['got-route', Model] | ['clicked-link', Model];

export type Action = ['route', ['Push', Model] | ['Replace', Model] | ['Back']];

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  switch (msg[0]) {
    case 'got-route': {
      return { model: msg[1], cmd: Cmd.None };
    }

    case 'clicked-link': {
      return { model, cmd: push(msg[1]) };
    }
  }
};

export const runAction = (action: Action, model: Model): [Model, Cmd<Msg>] => {
  switch (action[1][0]) {
    case 'Back': {
      return [model, Browser.back];
    }

    case 'Push': {
      return [model, Browser.push(encode(action[1][1]))];
    }

    case 'Replace': {
      return [model, Browser.replace(encode(action[1][1]))];
    }
  }
};

//
//
//
// Helpers
//
//
//

export const equals = (a: Model, b: Model): boolean => {
  return encode(a) === encode(b);
};
