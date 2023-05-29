import { PhoneNumber, UserId, client } from "@gamezilla/shared/app";
import {
  AppMsg,
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
} from "@gamezilla/shared/core";
import {
  ConformationDialog,
  IconEnvelope,
  IconGoogle,
  IconMobilePhone,
  LoadingBar,
  LoadingDialog,
  MyButton,
  cn,
} from "@gamezilla/shared/ui";
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
  msgs?: AppMsg[];
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
    };
  }

  if (msg.t === "got-current-user") {
    const currentUserId =
      msg.currentUser.t === "logged-in" ? msg.currentUser.currentUserId : null;
    return {
      model: { ...model, currentUser: msg.currentUser },
      cmd: sendToServer(msg),
      msgs: currentUserId
        ? [{ t: "user-logged-in", currentUserId }]
        : [{ t: "user-logged-out" }],
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

export const updateFromApp = ({
  msg,
  model,
  route,
}: {
  msg: AppMsg;
  model: Model;
  route: Route;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "user-logged-in" && route.t === "auth") {
    return {
      model,
      cmd: Route.push({
        t: "room",
        c: {
          t: "room-list",
        },
      }),
    };
  }

  if (msg.t === "user-logged-out" && route.t !== "auth") {
    return {
      model,
      cmd: Route.push({
        t: "auth",
        c: { t: "login" },
      }),
    };
  }
  return { model };
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
  $send,
}: {
  model: Model;
  $send: (m: Msg) => void;
  ctx: UnauthenticatedViewCtx;
}) => {
  return <ViewLogoutScreen ctx={ctx} model={model} $send={$send} />;
};

export const ViewLoggedOut = ({
  route,
  model,
  ctx,
  $send,
}: {
  route: RouteAuth;
  model: Model;
  $send: (m: Msg) => void;
  ctx: UnauthenticatedViewCtx;
}) => {
  if (route.t === "login") {
    return <ViewLoginScreen ctx={ctx} model={model} $send={$send} />;
  }

  if (route.t === "login-phone") {
    return (
      <AuthPhone.View
        model={model.phone}
        $send={(m) => $send({ t: "phone", c: m })}
      />
    );
  }

  if (route.t === "login-email-link") {
    return (
      <AuthEmailLink.View
        model={model.emailLink}
        $send={(m) => $send({ t: "email-link", c: m })}
      />
    );
  }

  if (route.t === "login-phone-verify") {
    return (
      <AuthPhoneVerify.View
        phoneNumber={route.phoneNumber}
        model={model.phoneVerify}
        $send={(m) => $send({ t: "phone-verify", c: m })}
      />
    );
  }

  return <ViewLoginScreen ctx={ctx} model={model} $send={$send} />;
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
  const isLoading = model.requests["login-with-google"]?.t === "loading";
  return (
    <div className="w-full h-full flex-1 flex flex-col relative">
      <LoadingBar
        className={cn(
          "absolute top-0 left-0 w-full",
          isLoading ? "block" : "hidden"
        )}
      />
      <div
        className={cn(
          "flex-1 flex flex-col justify-center items-center p-4 gap-8",
          isLoading && "opacity-50 pointer-events-none"
        )}>
        <div className="w-full flex flex-col items-start justify-center">
          <p className="text-2xl text-neutral-200">Sign in to</p>
          <h1 className="bg-gradient-to-b from-blue-400 to-blue-600 text-transparent bg-clip-text text-5xl font-extrabold pb-2">
            gamezilla.app
          </h1>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <MyButton
            onClick={() => $send({ t: "login-with-google" })}
            size="lg"
            className="w-full">
            <IconGoogle />
            Continue With Google
          </MyButton>

          <MyButton
            onClick={() =>
              ctx.$push({
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
              ctx.$push({ t: "auth", c: { t: "login-email-link" } })
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
  $send,
  ctx,
}: {
  ctx: UnauthenticatedViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  if (model.requests.logout?.t === "loading") {
    return <LoadingDialog open title={"Logging out..."} />;
  }

  return (
    <ConformationDialog
      open
      title="Logout of Gamezilla?"
      confirmTitle="Logout"
      onConfirm={() => {
        $send({ t: "logout" });
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

// client.auth.onAuthStateChange((_event, supabaseSession) => {
//   const msg = fromSupabaseSession(supabaseSession);
//   subject.next(msg);
// });

const fromSupabaseSession = (auth: SupabaseSession | null): Msg => {
  const userId = UserId.decode(auth?.user?.id);

  const name = String(
    auth?.user?.user_metadata?.["name"] ??
      auth?.user?.user_metadata?.["full_name"] ??
      ""
  );

  if (userId.t === "ok") {
    return {
      t: "got-current-user",
      currentUser: { t: "logged-in", currentUserId: userId.value, name },
    };
  }

  return {
    t: "got-current-user",
    currentUser: { t: "logged-out" },
  };
};

export const subscriptions: Sub<Msg> = subject;

const loadCurrentUser: Cmd<Msg> = ($send) => {
  setTimeout(() => {
    const supabaseSession = client.auth.session();
    const msg = fromSupabaseSession(supabaseSession);
    $send(msg);
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
