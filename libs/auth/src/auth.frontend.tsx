import { Cmd, Err, Ok, Result, Sub, Task, p } from '@gamezilla/core';
import {
  PhoneNumber,
  Route,
  UnauthenticatedViewCtx,
  UserId,
  client,
} from '@gamezilla/shared';
import {
  ConformationDialog,
  IconEnvelope,
  IconGoogle,
  IconMobilePhone,
  IconSpinner,
  LoadingDialog,
  MyButton,
} from '@gamezilla/shared/ui';
import { Session as SupabaseSession } from '@supabase/supabase-js';
import { Subject } from 'rxjs';
import * as AuthEmailLink from './auth-email-link';
import * as AuthPhone from './auth-phone';
import * as AuthPhoneVerify from './auth-phone-verify';
import {
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './auth.types';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init = (): { model: Model; cmd: Cmd<Msg> } => {
  const phone = AuthPhone.init();
  const phoneVerify = AuthPhoneVerify.init();
  const emailLink = AuthEmailLink.init;
  return {
    model: {
      currentUser: { t: 'not-asked' },
      requests: {},
      phone: phone.model,
      phoneVerify: phoneVerify.model,
      emailLink,
    },
    cmd: Cmd.None,
  };
};

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

export const update = ({
  sendToBackend,
  msg,
  model,
  route,
}: {
  route: Route.Route;
  sendToBackend: (m: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'login-with-google') {
    return {
      model,
      cmd: p(
        loginWithProvider({ provider: 'Google' }),
        Cmd.perform((result) => ({ t: 'login-done', result }))
      ),
    };
  }

  if (msg.t === 'login-done') {
    return { model };
  }

  if (msg.t === 'logout') {
    return {
      model,
      cmd: p(
        logout,
        Cmd.perform((result) => ({ t: 'logout-done', result }))
      ),
    };
  }

  if (msg.t === 'logout-done') {
    return { model };
  }

  if (msg.t === 'phone') {
    const updated = AuthPhone.update({
      msg: msg.c,
      model: model.phone,
      sendCode,
    });
    return {
      model: { ...model, phone: updated.model },
      cmd: Cmd.tag_('phone', updated.cmd),
    };
  }

  if (msg.t === 'phone-verify') {
    if (!(route.t === 'auth' && route.c.t === 'login-phone-verify')) {
      return { model };
    }

    const updated = AuthPhoneVerify.update({
      msg: msg.c,
      model: model.phoneVerify,
      verifyCode,
      phoneNumber: route.c.phoneNumber,
    });
    return {
      model: { ...model, phoneVerify: updated.model },
      cmd: Cmd.tag_('phone-verify', updated.cmd),
    };
  }

  if (msg.t === 'email-link') {
    const updated = AuthEmailLink.update({
      msg: msg.c,
      model: model.emailLink,
      sendEmailLink,
    });
    return {
      model: { ...model, emailLink: updated.model },
      cmd: Cmd.tag_('email-link', updated.cmd),
    };
  }

  if (msg.t === 'got-current-user') {
    console.log('got-current-user', msg.currentUser);
    return {
      model: { ...model, currentUser: msg.currentUser },
      cmd: sendToBackend(msg),
    };
  }

  return { model, cmd: sendToBackend(msg) };
};

export const updateFromBackend = ({
  model,
}: {
  msg: ToFrontend;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  return { model };
};

//
//
//
// View
//
//
//

export const View = ({
  route,
  model,
  ctx,
  $send,
}: {
  route: Route.RouteAuth;
  model: Model;
  $send: (m: Msg) => void;
  ctx: UnauthenticatedViewCtx;
}) => {
  if (route.t === 'login') {
    return <ViewLoginScreen ctx={ctx} model={model} $send={$send} />;
  }

  if (route.t === 'login-phone') {
    return (
      <AuthPhone.View
        model={model.phone}
        $send={(m) => $send({ t: 'phone', c: m })}
      />
    );
  }

  if (route.t === 'login-email-link') {
    return (
      <AuthEmailLink.View
        model={model.emailLink}
        $send={(m) => $send({ t: 'email-link', c: m })}
      />
    );
  }

  if (route.t === 'login-phone-verify') {
    return (
      <AuthPhoneVerify.View
        phoneNumber={route.phoneNumber}
        model={model.phoneVerify}
        $send={(m) => $send({ t: 'phone-verify', c: m })}
      />
    );
  }

  if (route.t === 'logout') {
    return <ViewLogoutScreen ctx={ctx} model={model} $send={$send} />;
  }

  const exhaustiveCheck: never = route;
  return exhaustiveCheck;
};

const ViewLoginScreen = ({
  $send,
  ctx,
  model,
}: {
  ctx: UnauthenticatedViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <div className="w-full h-full flex-1 flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center p-4 gap-8">
        <div className="w-full flex flex-col items-start justify-center">
          <p className="text-2xl">Sign in to</p>
          <h1 className="bg-gradient-to-b from-blue-400 to-blue-600 text-transparent bg-clip-text text-5xl font-extrabold pb-2">
            gamezilla.app
          </h1>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <MyButton
            onClick={() => $send({ t: 'login-with-google' })}
            size="lg"
            className="w-full"
          >
            {model.requests['login-with-google']?.type === 'Loading' && (
              <IconSpinner className="animate-spin" />
            )}
            <IconGoogle />
            Continue With Google
          </MyButton>

          <MyButton
            onClick={() =>
              ctx.$push({
                t: 'auth',
                c: { t: 'login-phone', isSelectingCountry: false },
              })
            }
            size="lg"
            className="w-full"
          >
            <IconMobilePhone />
            Continue With Text
          </MyButton>

          <MyButton
            onClick={() =>
              ctx.$push({ t: 'auth', c: { t: 'login-email-link' } })
            }
            size="lg"
            className="w-full"
          >
            <IconEnvelope />
            Continue With Email
          </MyButton>
        </div>
      </div>
    </div>
  );
};

const ViewLogoutScreen = ({
  model,
  $send,
  ctx,
}: {
  ctx: UnauthenticatedViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  if (model.requests.logout?.type === 'Loading') {
    return <LoadingDialog open title={'Logging out...'} />;
  }

  return (
    <ConformationDialog
      open
      title="Logout of Gamezilla?"
      confirmTitle="Logout"
      onConfirm={() => {
        $send({ t: 'logout' });
      }}
      onClose={() => {
        ctx.$back();
      }}
      onCancel={() => {
        ctx.$back();
      }}
    />
  );
};

//
//
//
// Subscriptions
//
//
//

const subject = new Subject<Msg>();

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

const fromSupabaseSession = (auth: SupabaseSession | null): Msg => {
  const userId = UserId.decode(auth?.user?.id);

  const name = String(
    auth?.user?.user_metadata?.['name'] ??
      auth?.user?.user_metadata?.['full_name'] ??
      ''
  );

  if (userId.type === 'Ok') {
    return {
      t: 'got-current-user',
      currentUser: { t: 'logged-in', currentUserId: userId.value, name },
    };
  }

  return {
    t: 'got-current-user',
    currentUser: { t: 'logged-out' },
  };
};

export const subscriptions: Sub<Msg> = subject;

//
//
//
//
//
//

export type Provider = 'Google';

export const loginWithProvider =
  ({ provider }: { provider: Provider }): Task<Result<string, null>> =>
  async () => {
    switch (provider) {
      case 'Google': {
        const response = await client.auth.signIn({
          provider: 'google',
        });

        if (response.error) {
          return Err(response.error.message);
        }

        return Ok(null);
      }
    }
  };

const sendCode =
  ({ phoneNumber }: { phoneNumber: PhoneNumber }): Task<Result<string, null>> =>
  async () => {
    const response = await client.auth.signIn({
      phone: PhoneNumber.toString(phoneNumber),
    });

    if (response.error) {
      return Result.Err(response.error.message);
    }

    return Result.Ok(null);
  };

const verifyCode =
  ({
    code,
    phoneNumber,
  }: {
    code: string;
    phoneNumber: PhoneNumber;
  }): Task<Result<string, null>> =>
  async () => {
    const response = await client.auth.verifyOTP({
      phone: PhoneNumber.toString(phoneNumber),
      token: code,
    });

    if (response.error) {
      return Result.Err(response.error.message);
    }

    return Result.Ok(null);
  };

const sendEmailLink =
  ({ emailAddress }: { emailAddress: string }): Task<Result<string, null>> =>
  async () => {
    const response = await client.auth.signIn({
      email: emailAddress,
    });

    if (response.error) {
      return Err(response.error.message);
    }

    return Ok(null);
  };

const logout: Task<Result<string, null>> = async () => {
  const { error } = await client.auth.signOut();

  if (error) {
    return Result.Err(error.message);
  }

  return Result.Ok(null);
};
