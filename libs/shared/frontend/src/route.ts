import {
  Iso3166Alpha2Code,
  PhoneNumber,
  RoomId,
  UserId,
} from '@gamezilla/shared';
import { Browser, Cmd } from '@gamezilla/shared/core';

//
//
//
// Model
//
//
//

export type Route =
  | { t: 'auth'; c: RouteAuth }
  | { t: 'profile'; c: RouteProfile }
  | { t: 'room'; c: RouteRoom }
  | { t: 'chat'; c: RouteChat }
  | { t: 'search' };

export const encode = (route: Route): string => {
  switch (route.t) {
    case 'auth':
      return encodeAuth(route.c);
    case 'profile':
      return encodeProfile(route.c);
    case 'room':
      return encodeRoom(route.c);
    case 'chat':
      return encodeChat(route.c);
    case 'search':
      return '/search';
  }
};

export const decode = (pathname: string): Route | null => {
  if (pathname.startsWith('/auth')) {
    const auth = decodeAuth(pathname);
    if (auth === null) {
      return null;
    }
    return { t: 'auth', c: auth };
  }
  if (pathname.startsWith('/profile')) {
    const profile = decodeProfile(pathname);
    if (profile === null) {
      return null;
    }
    return { t: 'profile', c: profile };
  }
  if (pathname.startsWith('/room')) {
    const room = decodeRoom(pathname);
    if (room === null) {
      return null;
    }
    return { t: 'room', c: room };
  }
  if (pathname.startsWith('/chat')) {
    const chat = decodeChat(pathname);
    if (chat === null) {
      return null;
    }
    return { t: 'chat', c: chat };
  }
  if (pathname.startsWith('/search')) {
    return { t: 'search' };
  }
  return null;
};

//
//
// Auth
//
//

export type RouteAuth =
  | { t: 'login' }
  | { t: 'login-email-link' }
  | { t: 'login-phone'; isSelectingCountry: boolean }
  | { t: 'login-phone-verify'; phoneNumber: PhoneNumber }
  | { t: 'logout' };

export const encodeAuth = (route: RouteAuth): string => {
  switch (route.t) {
    case 'login':
      return '/auth/login';
    case 'login-email-link':
      return '/auth/login/email-link';
    case 'login-phone':
      return '/auth/login/phone';
    case 'login-phone-verify':
      return `/auth/login/phone/verify/${
        route.phoneNumber._country
      }/${PhoneNumber.toString(route.phoneNumber)}`;
    case 'logout':
      return '/auth/logout';
  }
};
export const decodeAuth = (pathname: string): RouteAuth | null => {
  if (pathname === '/auth/login') {
    return { t: 'login' };
  }
  if (pathname === '/auth/login/email-link') {
    return { t: 'login-email-link' };
  }
  if (pathname === '/auth/login/phone') {
    return { t: 'login-phone', isSelectingCountry: false };
  }
  if (pathname === '/auth/login/phone/select-country') {
    return { t: 'login-phone', isSelectingCountry: true };
  }
  if (pathname.startsWith('/auth/login/phone/verify/')) {
    const split = pathname.split('/');
    const country = split[split.length - 2];
    const phoneNumber = split[split.length - 1];
    if (!country || !phoneNumber) {
      return null;
    }
    if (!Iso3166Alpha2Code.is(country)) {
      return null;
    }
    const decoded = PhoneNumber.decode(country, phoneNumber);
    if (decoded.type === 'Err') {
      return null;
    }
    return {
      t: 'login-phone-verify',
      phoneNumber: decoded.value,
    };
  }

  if (pathname === '/auth/logout') {
    return { t: 'logout' };
  }
  return null;
};

//
//
// Profile
//
//

export type RouteProfile =
  | { t: 'profile'; userId: UserId }
  | { t: 'profile-delete' }
  | { t: 'profile-update' }
  | { t: 'profile-update-avatar' }
  | { t: 'profile-update-username' }
  | { t: 'profile-update-theme' };

export const encodeProfile = (route: RouteProfile): string => {
  switch (route.t) {
    case 'profile':
      return `/profile/${route.userId}`;
    case 'profile-delete':
      return '/profile-delete';
    case 'profile-update':
      return '/profile-update';
    case 'profile-update-avatar':
      return '/profile-update-avatar';
    case 'profile-update-username':
      return '/profile-update-username';
    case 'profile-update-theme':
      return '/profile-update-theme';
  }
};
export const decodeProfile = (pathname: string): RouteProfile | null => {
  if (pathname.startsWith('/profile/')) {
    const userId = pathname.slice('/profile/'.length);
    if (UserId.is(userId)) {
      return { t: 'profile', userId };
    }
    return null;
  }
  if (pathname === '/profile-delete') {
    return { t: 'profile-delete' };
  }
  if (pathname === '/profile-update') {
    return { t: 'profile-update' };
  }
  if (pathname === '/profile-update-avatar') {
    return { t: 'profile-update-avatar' };
  }
  if (pathname === '/profile-update-username') {
    return { t: 'profile-update-username' };
  }
  if (pathname === '/profile-update-theme') {
    return { t: 'profile-update-theme' };
  }
  return null;
};

//
//
// Room
//
//

export type RouteRoom = { t: 'room'; roomId: RoomId } | { t: 'room-list' };

export const encodeRoom = (route: RouteRoom): string => {
  switch (route.t) {
    case 'room':
      return `/room/${route.roomId}`;
    case 'room-list':
      return '/room';
  }
};
export const decodeRoom = (pathname: string): RouteRoom | null => {
  if (pathname.startsWith('/room/')) {
    const roomId = pathname.slice('/room/'.length);
    if (RoomId.is(roomId)) {
      return { t: 'room', roomId };
    }
    return null;
  }
  if (pathname === '/room') {
    return { t: 'room-list' };
  }
  return null;
};

//
//
// Chat
//
//
export type RouteChat =
  | { t: 'chat' }
  | { t: 'chat-new' }
  | { t: 'chat-conversation'; conversationId: string };

export const encodeChat = (route: RouteChat): string => {
  switch (route.t) {
    case 'chat':
      return '/chat';
    case 'chat-new':
      return '/chat/new';
    case 'chat-conversation':
      return `/chat/conversation/${route.conversationId}`;
  }
};
export const decodeChat = (pathname: string): RouteChat | null => {
  if (pathname === '/chat') {
    return { t: 'chat' };
  }
  if (pathname === '/chat/new') {
    return { t: 'chat-new' };
  }
  if (pathname.startsWith('/chat/conversation/')) {
    const conversationId = pathname.slice('/chat/conversation/'.length);
    return { t: 'chat-conversation', conversationId };
  }
  return null;
};

//
//
//
// Cmd
//
//
//

export const push = (route: Route) => {
  return Browser.push(encode(route));
};

export const back = Browser.back;

export const replace = (route: Route) => {
  return Browser.replace(encode(route));
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
  model: Route;
}): {
  model: Route;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'clicked-back') {
    return { model, cmd: back };
  }

  if (msg.t === 'clicked-link') {
    return { model, cmd: push(msg.c) };
  }

  if (msg.t === 'route-changed') {
    return { model: msg.c };
  }

  const check: never = msg;
  return check;
};

export const eq = (a: Route, b: Route): boolean => {
  return encode(a) === encode(b);
};
