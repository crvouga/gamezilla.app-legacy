import { PhoneNumber, UserId, client } from "@gamezilla/shared/app";
import {
  ClientAppMsg,
  Route,
  RouteAuth,
  UnauthenticatedViewCtx,
} from "@gamezilla/shared/client";
import {
  Cmd,
  Err,
  Ok,
  RemoteResult,
  Result,
  Sub,
  Task,
  p,
} from "@gamezilla/core";
import {
  ConformationDialog,
  IconEnvelope,
  IconGoogle,
  IconMobilePhone,
  LoadingBar,
  LoadingScreen,
  MyButton,
  cn,
} from "@gamezilla/ui";
import { Session as SupabaseSession } from "@supabase/supabase-js";
import { Subject } from "rxjs";
import * as AuthEmailLink from "./auth-email-link";
import * as AuthPhone from "./auth-phone";
import * as AuthPhoneVerify from "./auth-phone-verify";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./auth.shared";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = (): { model: Model; cmd?: Cmd<Msg> } => {
  const phone = AuthPhone.init();
  const phoneVerify = AuthPhoneVerify.init();
  const emailLink = AuthEmailLink.init;
  return {
    model: {
      requests: {},
      phone: phone.model,
      phoneVerify: phoneVerify.model,
      emailLink,
      currentUser: { t: "loading" },
    },
    cmd: loadCurrentUser,
  };
};

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  sendToServer,
  msg,
  model,
  route,
}: {
  route: Route;
  sendToServer: (m: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  if (msg.t === "login-with-google") {
    return {
      model: {
        ...model,
        requests: {
          ...model.requests,
          "login-with-google": RemoteResult.Loading,
        },
      },
      cmd: p(
        loginWithProvider({ provider: "Google" }),
        Cmd.perform((result) => ({ t: "login-done", result }))
      ),
    };
  }

  if (msg.t === "login-done") {
    return {
      model,
      cmd: loadCurrentUser,
    };
  }

  if (msg.t === "logout") {
    return {
      model: {
        ...model,
        currentUser: {
          t: "loading",
        },
      },
      cmd: p(
        logout,
        Cmd.perform((result) => ({ t: "logout-done", result }))
      ),
    };
  }

  if (msg.t === "logout-done") {
    return {
      model: {
        ...model,
        currentUser: {
          t: "logged-out",
        },
      },
    };
  }

  if (msg.t === "phone") {
    const updated = AuthPhone.update({
      msg: msg.c,
      model: model.phone,
      sendCode,
    });
    return {
      ...updated,
      model: { ...model, phone: updated.model },
      cmd: Cmd.tag_("phone", updated.cmd),
    };
  }

  if (msg.t === "phone-verify") {
    if (!(route.t === "auth" && route.c.t === "login-phone-verify")) {
      return { model };
    }

    const updated = AuthPhoneVerify.update({
      msg: msg.c,
      model: model.phoneVerify,
      phoneNumber: route.c.phoneNumber,
      verifyCode,
    });
    return {
      model: {
        ...model,
        phoneVerify: updated.model,
        currentUser: updated.shouldLoadCurrentUser
          ? { t: "loading" }
          : model.currentUser,
      },
      cmd: Cmd.batch([
        Cmd.tag_("phone-verify", updated.cmd),
        updated.shouldLoadCurrentUser ? loadCurrentUser : Cmd.None,
      ]),
    };
  }

  if (msg.t === "email-link") {
    const updated = AuthEmailLink.update({
      msg: msg.c,
      model: model.emailLink,
      sendEmailLink,
    });
    return {
      model: { ...model, emailLink: updated.model },
      cmd: Cmd.tag_("email-link", updated.cmd),
      msgs: updated.msgs,
    };
  }

  if (msg.t === "user-authenticated") {
    return {
      model: { ...model, currentUser: { t: "logged-in", userId: msg.userId } },
      cmd: sendToServer(msg),
      msgs: [{ t: "got-current-user", userId: msg.userId }],
    };
  }

  if (msg.t === "user-unauthenticated") {
    return {
      model: { ...model, currentUser: { t: "logged-out" } },
      cmd: sendToServer(msg),
      msgs: [
        { t: "got-current-user", userId: null },
        { t: "push-route", route: { t: "auth", c: { t: "login" } } },
      ],
    };
  }

  return { model, cmd: sendToServer(msg) };
};

export const updateFromServer = ({
  model,
}: {
  msg: ToClient;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  return { model };
};

export const updateFromApp = (input: {
  msg: ClientAppMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return input;
};
//
//
//
// View
//
//
//

export const ViewLoggedIn = ({
  model,
  ctx,
  dispatch,
}: {
  model: Model;
  dispatch: (m: Msg) => void;
  ctx: UnauthenticatedViewCtx;
}) => {
  return <ViewLogoutScreen ctx={ctx} model={model} dispatch={dispatch} />;
};

export const ViewLoggedOut = ({
  route,
  model,
  ctx,
  dispatch,
}: {
  route: RouteAuth;
  model: Model;
  dispatch: (m: Msg) => void;
  ctx: UnauthenticatedViewCtx;
}) => {
  if (route.t === "login") {
    return <ViewLoginScreen ctx={ctx} model={model} dispatch={dispatch} />;
  }

  if (route.t === "login-phone") {
    return (
      <AuthPhone.View
        ctx={ctx}
        model={model.phone}
        dispatch={(m) => dispatch({ t: "phone", c: m })}
      />
    );
  }

  if (route.t === "login-email-link") {
    return (
      <AuthEmailLink.View
        model={model.emailLink}
        dispatch={(m) => dispatch({ t: "email-link", c: m })}
      />
    );
  }

  if (route.t === "login-phone-verify") {
    return (
      <AuthPhoneVerify.View
        phoneNumber={route.phoneNumber}
        model={model.phoneVerify}
        dispatch={(m) => dispatch({ t: "phone-verify", c: m })}
      />
    );
  }

  return <ViewLoginScreen ctx={ctx} model={model} dispatch={dispatch} />;
};

const ViewLoginScreen = ({
  dispatch,
  ctx,
  model,
}: {
  ctx: UnauthenticatedViewCtx;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  const isLoading = model.requests["login-with-google"]?.t === "loading";
  return (
    <div className="relative flex h-full w-full flex-1 flex-col">
      <LoadingBar
        disabled={!isLoading}
        className="absolute left-0 top-0 w-full"
      />
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-8 p-4",
          isLoading && "pointer-events-none opacity-50"
        )}>
        <div className="flex w-full flex-col items-start justify-center">
          <p className="text-2xl text-neutral-200">Sign in to</p>
          <h1 className="bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text pb-2 text-5xl font-extrabold text-transparent">
            gamezilla.app
          </h1>
        </div>

        <div className="flex w-full flex-col gap-6">
          <MyButton
            onClick={() => dispatch({ t: "login-with-google" })}
            size="lg"
            className="w-full">
            <IconGoogle />
            Continue With Google
          </MyButton>

          <MyButton
            onClick={() =>
              ctx.onPush({
                t: "auth",
                c: { t: "login-phone", isSelectingCountry: false },
              })
            }
            size="lg"
            className="w-full">
            <IconMobilePhone />
            Continue With Text
          </MyButton>

          <MyButton
            onClick={() =>
              ctx.onPush({ t: "auth", c: { t: "login-email-link" } })
            }
            size="lg"
            className="w-full">
            <IconEnvelope />
            Continue With Email
          </MyButton>
        </div>
      </div>
    </div>
  );
};

export const ViewLogoutScreen = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: UnauthenticatedViewCtx;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  if (model.requests.logout?.t === "loading") {
    return <LoadingScreen />;
  }

  return (
    <ConformationDialog
      open
      title="Logout of Gamezilla?"
      confirmTitle="Logout"
      onConfirm={() => {
        dispatch({ t: "logout" });
      }}
      onClose={() => {
        ctx.onBack();
      }}
      onCancel={() => {
        ctx.onBack();
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

const fromSupabaseSession = (auth: SupabaseSession | null): Msg => {
  const userId = UserId.decode(auth?.user?.id);

  if (userId.t === "ok") {
    return {
      t: "user-authenticated",
      userId: userId.value,
    };
  }

  return {
    t: "user-unauthenticated",
  };
};

export const subscriptions: Sub<Msg> = subject;

const loadCurrentUser: Cmd<Msg> = (dispatch) => {
  setTimeout(() => {
    const supabaseSession = client.auth.session();
    const msg = fromSupabaseSession(supabaseSession);
    dispatch(msg);
  }, 1_000);
};

//
//
//
//
//
//

export type Provider = "Google";

export const loginWithProvider =
  ({ provider }: { provider: Provider }): Task<Result<string, null>> =>
  async () => {
    switch (provider) {
      case "Google": {
        const response = await client.auth.signIn({
          provider: "google",
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
      return Err(response.error.message);
    }

    return Ok(null);
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
      return Err(response.error.message);
    }

    return Ok(null);
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
    return Err(error.message);
  }

  return Ok(null);
};
