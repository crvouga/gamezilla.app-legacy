import {
  Cmd,
  exhaustive,
  Option,
  p,
  Result,
  Sub,
  Task,
  Unit,
} from '@gamezilla/core';
import { PhoneNumber, UserId } from '@gamezilla/shared';
import { client } from '@gamezilla/shared';
import { Session as SupabaseSession } from '@supabase/supabase-js';
import * as Rx from 'rxjs';

//
//
//
// Model
//
//
//

export type Session = { defaultName: string; userId: UserId };

export type Model =
  | { type: 'loading' }
  | { type: 'logged-out' }
  | { type: 'logged-in'; session: Session };

export const init = (): [Model, Cmd<Msg>] => {
  return [
    { type: 'loading' },
    p(
      getSession,
      Cmd.perform((msg) => msg)
    ),
  ];
};

//
//
//
// Msg
//
//
//

export type Msg =
  | ['got-session', Option<Session>]
  | ['login-done', Result<null, null>]
  | ['logout-done', Result<null, null>];

export type Action = ['auth', ['logout']];

export type ToBackend = ['UserLoggedIn', UserId];

//
//
//
// Update
//
//
//

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'got-session':
      switch (msg[1].type) {
        case 'none':
          return [{ type: 'logged-out' }, Cmd.None];

        case 'Some':
          return [
            { type: 'logged-in', session: msg[1].value },
            sendToBackend(['UserLoggedIn', msg[1].value.userId]),
          ];

        default: {
          return [model, Cmd.None];
        }
      }

    case 'login-done': {
      return [model, Cmd.None];
    }

    case 'logout-done':
      switch (msg[1].type) {
        case 'Err':
          return [model, Cmd.None];

        case 'Ok':
          return [{ type: 'logged-out' }, Cmd.None];

        default:
          return exhaustive(msg[1]);
      }

    default:
      return exhaustive(msg[0]);
  }
};

export const runAction = (action: Action, model: Model): [Model, Cmd<Msg>] => {
  switch (action[0]) {
    case 'auth': {
      switch (action[1][0]) {
        case 'logout':
          return [
            model,
            p(
              logout,
              Cmd.perform((): Msg => ['logout-done', Result.Ok(null)])
            ),
          ];
      }
    }
  }
};

//
//
//
// Auth
//
//
//

type Problem = { message: string };

export type AuthResult = Result<Problem, Unit>;

export const loginWithEmailAndPassword =
  ({
    emailAddress,
    password,
  }: {
    emailAddress: string;
    password: string;
  }): Task<AuthResult> =>
  async () => {
    const response = await client.auth.signIn({
      email: emailAddress,
      password: password,
    });

    if (response.error) {
      return Result.Err({ message: response.error.message });
    }

    return Result.Ok(Unit);
  };

export const sendCode =
  ({ phoneNumber }: { phoneNumber: PhoneNumber }): Task<AuthResult> =>
  async () => {
    const response = await client.auth.signIn({
      phone: PhoneNumber.toString(phoneNumber),
    });

    if (response.error) {
      return Result.Err({ message: response.error.message });
    }

    return Result.Ok(Unit);
  };

export const verifyCode =
  ({
    code,
    phoneNumber,
  }: {
    code: string;
    phoneNumber: PhoneNumber;
  }): Task<AuthResult> =>
  async () => {
    const response = await client.auth.verifyOTP({
      phone: PhoneNumber.toString(phoneNumber),
      token: code,
    });

    if (response.error) {
      return Result.Err({ message: response.error.message });
    }

    return Result.Ok(Unit);
  };

export const loginWithEmailLink =
  ({ emailAddress }: { emailAddress: string }): Task<AuthResult> =>
  async () => {
    const response = await client.auth.signIn({
      email: emailAddress,
    });

    if (response.error) {
      return Result.Err({ message: response.error.message });
    }

    return Result.Ok(Unit);
  };

export type Provider = 'Google';

export const loginWithProvider =
  ({ provider }: { provider: Provider }): Task<AuthResult> =>
  async () => {
    switch (provider) {
      case 'Google': {
        const response = await client.auth.signIn({
          provider: 'google',
        });

        if (response.error) {
          return Result.Err({ message: response.error.message });
        }

        return Result.Ok(Unit);
      }
    }
  };

const logout: Task<Result<null, null>> = async () => {
  const { error } = await client.auth.signOut();

  if (error) {
    return Result.Err(null);
  }

  return Result.Ok(null);
};

const getSession: Task<Msg> = async () => {
  const session = client.auth.session();

  return fromSupabaseSession(session);
};

//
//
//
// Subscriptions
//
//
//

const subject = new Rx.Subject<Msg>();

client.auth.onAuthStateChange((event, supabaseSession) => {
  switch (event) {
    case 'PASSWORD_RECOVERY':
    case 'SIGNED_IN':
    case 'SIGNED_OUT':
    case 'TOKEN_REFRESHED':
    case 'USER_DELETED':
    case 'USER_UPDATED': {
      const msg = fromSupabaseSession(supabaseSession);
      subject.next(msg);
    }
  }
});

export const subscriptions: Sub<Msg> = subject;

//
//
//
// Helper
//
//
//

export const fromSupabaseSession = (auth: SupabaseSession | null): Msg => {
  const userId = UserId.decode(auth?.user?.id);

  const defaultName = String(
    auth?.user?.user_metadata?.['name'] ??
      auth?.user?.user_metadata?.['full_name'] ??
      ''
  );

  if (userId.type === 'Ok') {
    return ['got-session', Option.Some({ userId: userId.value, defaultName })];
  }

  return ['got-session', Option.None];
};
