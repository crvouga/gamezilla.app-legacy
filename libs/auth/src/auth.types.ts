import { RemoteData, Result } from '@gamezilla/core';
import { PhoneNumber, SessionId, UserId } from '@gamezilla/shared';
import * as AuthEmailLink from './auth-email-link';
import * as AuthPhone from './auth-phone';
import * as AuthPhoneVerify from './auth-phone-verify';

export type FrontendModel = {
  currentUser:
    | { t: 'not-asked' }
    | { t: 'loading' }
    | { t: 'logged-out' }
    | { t: 'logged-in'; currentUserId: UserId; name?: string };
  requests: {
    [key in Req['t']]?: RemoteData<string, null>;
  };
  phone: AuthPhone.Model;
  phoneVerify: AuthPhoneVerify.Model;
  emailLink: AuthEmailLink.Model;
};

export type BackendModel = {
  sessions: {
    [sessionId: SessionId]: {
      sessionId: SessionId;
      userId: UserId;
    };
  };

  verifications: {
    [requestId: string]: {
      requestId: string;
      phoneNumber: PhoneNumber;
      code: number;
    };
  };
};

//
//
// Msg
//
//

type Event = {
  t: 'got-current-user';
  currentUser: FrontendModel['currentUser'];
};

export type FrontendMsg =
  | Req
  | Event
  | { t: 'login-done'; result: Result<string, null> }
  | { t: 'logout-done'; result: Result<string, null> }
  | { t: 'phone'; c: AuthPhone.Msg }
  | { t: 'phone-verify'; c: AuthPhoneVerify.Msg }
  | { t: 'email-link'; c: AuthEmailLink.Msg };

export type BackendMsg = { t: 'none' };

export type ToBackend = Req | Event;

export type ToFrontend = Res;

export type Req =
  | { t: 'logout' }
  | { t: 'login-with-google' }
  | { t: 'send-code'; phoneNumber: PhoneNumber }
  | { t: 'verify-code'; phoneNumber: PhoneNumber; code: number };

export type Res = Req & { result: Result<string, null> };
