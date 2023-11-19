import { Eff, loading, notAsked, Sub, chain } from "gamezilla/@SHARED/core";
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
  playSound,
  APP_SOUND,
  ClientCtx,
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
import * as AuthClientSMS from "./@CHILD/auth-sms/auth-sms.client";

//
//
//
// Model
//
//
//

export const init = ({
  stored,
}: {
  stored: ClientModel | null;
}): { model: ClientModel; eff?: Eff<ClientMsg> } => {
  if (stored) {
    return {
      model: stored,
    };
  }

  return {
    model: {
      currentUser: { t: "loading" },
      loginWithGoogle: notAsked,
      logout: notAsked,
      sms: AuthClientSMS.init,
    },
  };
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
  ctx,
}: {
  ctx: AnonymousClientCtx;
  route: AppRoute;
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  evt?: ClientEvt[];
} => {
  switch (msg.t) {
    case "clicked-logout": {
      return {
        model: {
          ...model,
          currentUser: { t: "logged-out" },
        },
        cmd: [sendToServer({ t: "logout" })],
      };
    }

    case "sms": {
      const updated = AuthClientSMS.update({
        model: model.sms,
        msg: msg.c,
        ctx,
      });
      return {
        model: {
          ...model,
          sms: updated.model,
        },
        cmd: ClientCmd.tag("sms", updated.cmd),
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
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  switch (msg.t) {
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
        (model): ReturnType<typeof updateFromServer> => {
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
          if (msg.loggedIn) {
            return {
              model,
              cmd: [playSound(APP_SOUND.navForward)],
            };
          }
          return { model };
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

    case "sms": {
      const updated = AuthClientSMS.updateFromServer({
        model: model.sms,
        msg: msg.c,
      });
      return {
        model: { ...model, sms: updated.model },
        cmd: ClientCmd.tag("sms", updated.cmd),
      };
    }
  }
};

export const updateFromEvent = ({
  model,
  evt,
  ctx,
}: {
  ctx: AnonymousClientCtx;
  evt: ClientEvt;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  return chain(
    { model },
    (model) => handleAuthRouteGuard({ ctx, model, evt }),
    (model) => {
      const updated = AuthClientSMS.updateFromEvent({
        model: model.sms,
        evt: evt,
      });
      return {
        model: { ...model, sms: updated.model },
      };
    }
  );
};

const handleAuthRouteGuard: typeof updateFromEvent = ({ model, evt }) => {
  switch (evt.t) {
    case "route-changed": {
      if (model.currentUser.t === "logged-in" && evt.route.t === "auth") {
        return {
          model,
          cmd: [replaceRoute({ t: "space", c: { t: "space-list" } })],
        };
      }

      if (model.currentUser.t === "logged-in" && evt.route.t !== "auth") {
        return {
          model,
          cmd: [replaceRoute({ t: "auth", c: { t: "login" } })],
        };
      }

      return { model };
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

export const subscriptions = ({
  intervalId,
  model,
}: {
  intervalId: string;
  model: ClientModel;
}): Sub<ClientMsg> => {
  return Sub.tag(
    "sms",
    AuthClientSMS.subscriptions({
      model: model.sms,
      intervalId: `${intervalId}/sms`,
    })
  );
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
  route,
}: {
  location: Location;
  route: RouteAuth;
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
  ctx: AnonymousViewCtx;
}) => {
  switch (route.t) {
    case "login": {
      return <ViewLoginScreen ctx={ctx} model={model} dispatch={dispatch} />;
    }

    case "login-phone-verify":
    case "login-phone": {
      return (
        <AuthClientSMS.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "sms", c })}
          route={route}
          model={model.sms}
        />
      );
    }

    case "login-email-link": {
      return null;
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
    <div class="relative flex h-full w-full flex-1 flex-col">
      <LoadingBar disabled={!isLoading} class="absolute left-0 top-0 w-full" />
      <div
        class={cn(
          "flex flex-1 flex-col items-center justify-center gap-8 p-4",
          isLoading && "pointer-events-none opacity-50"
        )}>
        <div class="flex w-full flex-col items-start justify-center">
          <p class="text-2xl text-neutral-200">Sign in to</p>
          <h1 class="bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text pb-2 text-5xl font-extrabold text-transparent">
            gamezilla.app
          </h1>
        </div>

        <div class="flex w-full flex-col gap-6">
          <Button
            onClick={() =>
              ctx.push({
                t: "auth",
                c: { t: "login-phone", isSelectingCountry: false },
              })
            }
            size="lg"
            class="w-full"
            start={<IconMobilePhone class="h-6 w-6" />}
            text="Continue With Phone"
          />

          {false && (
            <Button
              onClick={() =>
                ctx.push({ t: "auth", c: { t: "login-email-link" } })
              }
              size="lg"
              class="w-full"
              start={<IconEnvelope class="h-6 w-6" />}
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
