import { Eff, Loading, NotAsked, Sub } from "gamezilla/@SHARED/core";
import {
  AnonymousClientCtx,
  AnonymousViewCtx,
  ClientCmd,
  ClientEvt,
  Route,
  RouteAuth,
  replaceRoute,
  sendToServer,
} from "gamezilla/app/@SHARED/client";
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
import { createAuthenticator } from "./auth-client-authenticator/authenticator-impl.supabase";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./auth.core";

//
//
//
//
//
//

// const authService = createAuthService();
const authenticator = createAuthenticator();

//
//
//
// Model
//
//
//

export const init: { model: ClientModel; eff?: Eff<ClientMsg> } = {
  model: {
    currentUser: { t: "loading" },
    loginWithGoogle: NotAsked,
    logout: NotAsked,
  },
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
          loginWithGoogle: Loading,
        },
        cmd: [sendToServer({ t: "started-social-login" })],
        eff: async () => {
          await authenticator.startSocialLogin({
            provider: "google",
          });
        },
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
        cmd: [sendToServer({ t: "logout" })],
      };
    }

    case "got-social-login-result": {
      return {
        model,
        cmd: [sendToServer(msg)],
      };
    }
  }
};

export const updateFromEvt = ({
  ctx,
  model,
  msg,
}: {
  ctx: AnonymousClientCtx;
  msg: ClientEvt;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<ToServer>[];
} => {
  switch (msg.t) {
    case "client-unauthenticated": {
      if (ctx.currentRoute.t === "auth") {
        return {
          model: {
            ...model,
            currentUser: { t: "logged-out" },
          },
        };
      }
      return {
        model: {
          ...model,
          currentUser: { t: "logged-out" },
        },
        cmd: [replaceRoute({ t: "auth", c: { t: "login" } })],
      };
    }

    case "client-authenticated": {
      if (ctx.currentRoute.t === "auth") {
        return {
          model: {
            ...model,
            currentUser: { t: "logged-in", userId: msg.userId },
          },
          cmd: [replaceRoute({ t: "space", c: { t: "space-list" } })],
        };
      }

      return {
        model: {
          ...model,
          currentUser: { t: "logged-in", userId: msg.userId },
        },
      };
    }

    default: {
      return { model };
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
    case "get-social-login-result": {
      return {
        model,
        eff: async (dispatch) => {
          const result = await authenticator.getSocialLoginResult();
          dispatch({ t: "got-social-login-result", result });
        },
      };
    }
    case "client-unauthenticated": {
      return {
        model: {
          ...model,
          currentUser: { t: "logged-out" },
        },
        evt: [msg],
      };
    }
    case "client-authenticated": {
      return {
        model: {
          ...model,
          currentUser: { t: "logged-in", userId: msg.userId },
        },
        evt: [msg],
      };
    }
    default: {
      return { model };
    }
  }
};

//
//
//
//
//

export const subscriptions = (_model: ClientModel): Sub<ClientMsg> => {
  return Sub.None;
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
  dispatch,
}: {
  route: RouteAuth;
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
  ctx: AnonymousViewCtx;
}) => {
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
  const isLoading = model.loginWithGoogle?.t === "loading";
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
  if (model.logout?.t === "loading") {
    return <LoadingScreen />;
  }

  return (
    <ConformationDialog
      open
      title="Logout of Gamezilla?"
      confirmTitle="Logout"
      onClose={ctx.back}
      onCancel={ctx.back}
      onConfirm={() => {
        dispatch({ t: "logout" });
      }}
    />
  );
};
