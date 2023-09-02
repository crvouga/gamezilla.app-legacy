import { Session as SupabaseSession } from "@supabase/supabase-js";
import {
  Eff,
  Err,
  Ok,
  PhoneNumber,
  RemoteResult,
  Result,
  Sub,
  Task,
  p,
} from "gamezilla/@SHARED/core";
import {
  AnonymousViewCtx,
  ClientCmd,
  ClientEvt,
  Route,
  RouteAuth,
} from "gamezilla/app/@SHARED/client";
import { UserId } from "gamezilla/app/@SHARED/data";
import { supabaseClient } from "gamezilla/app/@SHARED/third-party-services";
import {
  Button,
  ConformationDialog,
  IconEnvelope,
  IconGoogle,
  IconMobilePhone,
  LoadingBar,
  LoadingScreen,
  cn,
} from "gamezilla/app/@SHARED/ui";
import { AuthEmailLink, AuthPhone, AuthPhoneVerify } from "./auth-client";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./auth.core";

//
//
//
// Model
//
//
//

const phone = AuthPhone.init;
const phoneVerify = AuthPhoneVerify.init;
const emailLink = AuthEmailLink.init;
export const init: { model: ClientModel; eff?: Eff<ClientMsg> } = {
  model: {
    requests: {},
    phone: phone.model,
    phoneVerify: phoneVerify.model,
    emailLink,
    currentUser: { t: "loading" },
  },
  eff: loadCurrentUser,
};

//
//
//
// Update
//
//
//

export const update = ({
  msg,
  model,
  route,
}: {
  route: Route;
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<ToServer>[];
  evt?: ClientEvt[];
} => {
  switch (msg.t) {
    case "login-with-google": {
      return {
        model: {
          ...model,
          requests: {
            ...model.requests,
            "login-with-google": RemoteResult.Loading,
          },
        },
        eff: p(
          loginWithProvider({ provider: "Google" }),
          Eff.perform((result) => ({ t: "login-done", result }))
        ),
      };
    }

    case "login-done": {
      return {
        model,
        eff: loadCurrentUser,
      };
    }

    case "logout": {
      return {
        model: {
          ...model,
          currentUser: {
            t: "loading",
          },
        },
        eff: p(
          logout,
          Eff.perform((result) => ({ t: "logout-done", result }))
        ),
      };
    }

    case "logout-done": {
      return {
        model: {
          ...model,
          currentUser: {
            t: "logged-out",
          },
        },
      };
    }

    case "phone": {
      const updated = AuthPhone.update({
        msg: msg.c,
        model: model.phone,
        sendCode,
      });
      return {
        cmd: updated.cmd,
        model: { ...model, phone: updated.model },
        eff: Eff.t("phone", updated.eff),
      };
    }

    case "phone-verify": {
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
        ...updated,
        model: {
          ...model,
          phoneVerify: updated.model,
          currentUser: updated.shouldLoadCurrentUser
            ? { t: "loading" }
            : model.currentUser,
        },
        cmd: updated.cmd,
        eff: Eff.batch([
          Eff.t("phone-verify", updated.eff),
          updated.shouldLoadCurrentUser ? loadCurrentUser : Eff.None,
        ]),
      };
    }

    case "email-link": {
      const updated = AuthEmailLink.update({
        msg: msg.c,
        model: model.emailLink,
        sendEmailLink,
      });
      return {
        model: { ...model, emailLink: updated.model },
        eff: Eff.t("email-link", updated.eff),
        cmd: updated.cmd,
      };
    }

    case "client-authenticated": {
      return {
        model: {
          ...model,
          currentUser: { t: "logged-in", userId: msg.userId },
        },
        cmd: [{ t: "send-to-server", msg }],
      };
    }

    case "client-unauthenticated": {
      return {
        model: { ...model, currentUser: { t: "logged-out" } },
        cmd: [{ t: "send-to-server", msg }],
      };
    }

    default: {
      return {
        model,
        cmd: [{ t: "send-to-server", msg }],
      };
    }
  }
};

export const updateFromServer = ({
  model,
  msg,
}: {
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  evt?: ClientEvt[];
} => {
  switch (msg.t) {
    case "acknowledged": {
      switch (msg.msg.t) {
        case "client-unauthenticated":
        case "client-authenticated": {
          return { model, evt: [msg.msg] };
        }

        default: {
          return { model };
        }
      }
    }
    default: {
      return { model };
    }
  }
};

export const updateFromEvt = ({
  model,
}: {
  msg: ClientEvt;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
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
  dispatch,
}: {
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
  ctx: AnonymousViewCtx;
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
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
  ctx: AnonymousViewCtx;
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
        ctx={ctx}
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
  ctx: AnonymousViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
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
          <Button
            onClick={() => dispatch({ t: "login-with-google" })}
            size="lg"
            className="w-full"
            start={<IconGoogle className="h-6 w-6" />}
            text="Continue With Google"
          />

          {false && (
            <Button
              onClick={() =>
                ctx.push({
                  t: "auth",
                  c: { t: "login-phone", isSelectingCountry: false },
                })
              }
              size="lg"
              className="w-full"
              start={<IconMobilePhone className="h-6 w-6" />}
              text="Continue With Text"
            />
          )}

          {false && (
            <Button
              onClick={() =>
                ctx.push({ t: "auth", c: { t: "login-email-link" } })
              }
              size="lg"
              className="w-full"
              start={<IconEnvelope className="h-6 w-6" />}
              text="Continue With Email"
            />
          )}
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
  ctx: AnonymousViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
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
        ctx.back();
      }}
      onCancel={() => {
        ctx.back();
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

const fromSupabaseSession = (auth: SupabaseSession | null): ClientMsg => {
  const userId = UserId.decode(auth?.user?.id);

  if (userId.t === "ok") {
    return {
      t: "client-authenticated",
      userId: userId.value,
    };
  }

  return {
    t: "client-unauthenticated",
  };
};

export const subscriptions: Sub<ClientMsg> = Sub.None;

function loadCurrentUser(dispatch: (m: ClientMsg) => void) {
  setTimeout(() => {
    const supabaseSession = supabaseClient.auth.session();
    const msg = fromSupabaseSession(supabaseSession);
    dispatch(msg);
  }, 1_000);
}

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
        const response = await supabaseClient.auth.signIn({
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
    const response = await supabaseClient.auth.signIn({
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
    const response = await supabaseClient.auth.verifyOTP({
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
    const response = await supabaseClient.auth.signIn({
      email: emailAddress,
    });

    if (response.error) {
      return Err(response.error.message);
    }

    return Ok(null);
  };

const logout: Task<Result<string, null>> = async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    return Err(error.message);
  }

  return Ok(null);
};
