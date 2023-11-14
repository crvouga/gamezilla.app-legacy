import { Eff, Loading, NotAsked, Sub, chain } from "gamezilla/@SHARED/core";
import {
  AnonymousClientCtx,
  AnonymousViewCtx,
  ClientCmd,
  ClientEvt,
  Location,
  AppRoute,
  RouteAuth,
  replaceRoute,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Button,
  ConformationDialog,
  IconEnvelope,
  IconGoogle,
  IconMobilePhone,
  LoadingBar,
  LoadingScreen,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { createSocialLogin } from "./auth-client/social-login";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./auth.core";
import { toRoute } from "./@SHARED/auth-client-route";

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

const socialLogin = createSocialLogin();

export const update = ({
  msg,
  model,
}: {
  route: AppRoute;
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<ToServer>[];
  evt?: ClientEvt[];
} => {
  switch (msg.t) {
    case "clicked-login-with-google": {
      return {
        model: {
          ...model,
          loginWithGoogle: Loading,
        },
        cmd: [sendToServer({ t: "started-social-login" })],
        eff: async () => {
          await socialLogin.redirectSocialLogin({
            provider: "google",
          });
        },
      };
    }

    case "clicked-logout": {
      return {
        model: {
          ...model,
          currentUser: { t: "loading" },
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

export const updateFromServer = ({
  model,
  msg,
  ctx,
}: {
  ctx: AnonymousClientCtx;
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  evt?: ClientEvt[];
  cmd?: ClientCmd<ToServer>[];
} => {
  switch (msg.t) {
    case "get-social-login-result": {
      return {
        model,
        eff: async (dispatch) => {
          const result = await socialLogin.getSocialLoginResult();
          dispatch({ t: "got-social-login-result", result });
        },
      };
    }

    case "client-unauthenticated": {
      return chain(
        { model },
        (model) => {
          return {
            model: { ...model, currentUser: { t: "logged-out" } },
            evt: [msg],
          };
        },
        (model) => {
          if (ctx.currentRoute.t !== "auth") {
            return {
              model,
              cmd: [replaceRoute({ t: "auth", c: { t: "login" } })],
            };
          }
          return { model };
        }
      );
    }

    case "client-authenticated": {
      return chain(
        { model },
        (model) => {
          return {
            model: {
              ...model,
              currentUser: {
                t: "logged-in",
                userId: msg.userId,
              },
            },
            evt: [msg],
          };
        },
        (model) => {
          if (ctx.currentRoute.t === "auth") {
            return {
              model,
              cmd: [replaceRoute({ t: "space", c: { t: "space-list" } })],
            };
          }
          return { model };
        }
      );
    }
  }
};

export const updateFromEvent = ({
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
  model,
  ctx,
  location,
  dispatch,
}: {
  location: Location;
  route: RouteAuth;
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
  ctx: AnonymousViewCtx;
}) => {
  const route = toRoute(location);

  switch (route.t) {
    case "/": {
      return <ViewLoginScreen ctx={ctx} model={model} dispatch={dispatch} />;
    }

    case "/sms": {
      return <ViewLogoutScreen ctx={ctx} model={model} dispatch={dispatch} />;
    }
  }
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
            onClick={() => dispatch({ t: "clicked-login-with-google" })}
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
      onConfirm={() => dispatch({ t: "clicked-logout" })}
    />
  );
};
