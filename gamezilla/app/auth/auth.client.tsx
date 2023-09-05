import { Eff, NotAsked, RemoteResult, Sub } from "gamezilla/@SHARED/core";
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
import { AuthEmailLink, AuthPhone, AuthPhoneVerify } from "./auth-client";
import { AuthService, createAuthService } from "./auth-service";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./auth.core";

//
//
//
//
//
//

const authService = createAuthService();

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
  // eff: loadCurrentUser(authService),
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
        eff: async (dispatch) => {
          const loggedIn = await authService.loginWithProvider({
            provider: "google",
          });
          dispatch({ t: "login-done", result: loggedIn });
        },
      };
    }

    case "login-done": {
      return {
        model,
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
        eff: async (dispatch) => {
          const loggedOut = await authService.logout();
          dispatch({ t: "logout-done", result: loggedOut });
        },
      };
    }

    case "logout-done": {
      return {
        model: {
          ...model,
          currentUser: { t: "loading" },
        },
        cmd: [sendToServer({ t: "logged-out-client-side" })],
      };
    }

    case "phone": {
      const updated = AuthPhone.update({
        msg: msg.c,
        model: model.phone,
        authService: authService,
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
        authService: authService,
      });

      return {
        ...updated,
        model: {
          ...model,
          phoneVerify: updated.model,
        },
        cmd: updated.cmd,
        eff: Eff.t("phone-verify", updated.eff),
      };
    }

    case "email-link": {
      const updated = AuthEmailLink.update({
        msg: msg.c,
        model: model.emailLink,
        authService: authService,
      });

      return {
        model: { ...model, emailLink: updated.model },
        eff: Eff.t("email-link", updated.eff),
        cmd: updated.cmd,
      };
    }

    case "auth-state-changed": {
      if (msg.userId) {
        return {
          model,
          cmd: [
            sendToServer({ t: "logged-in-client-side", userId: msg.userId }),
          ],
        };
      }
      return {
        model,
        cmd: [sendToServer({ t: "logged-out-client-side" })],
      };
    }

    default: {
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
    case "document-visibility-changed": {
      if (
        msg.state === "hidden" &&
        model.requests["login-with-google"]?.t === "loading"
      ) {
        return {
          model: {
            ...model,
            requests: {
              ...model.requests,
              "login-with-google": NotAsked,
            },
          },
        };
      }
      return { model };
    }

    case "client-unauthenticated": {
      if (ctx.currentRoute.t === "auth") {
        return { model };
      }
      return {
        model,
        cmd: [replaceRoute({ t: "auth", c: { t: "login" } })],
      };
    }

    case "client-authenticated": {
      if (ctx.currentRoute.t === "auth") {
        return {
          model,
          cmd: [replaceRoute({ t: "space", c: { t: "space-list" } })],
        };
      }

      return { model };
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
  return Sub.map(authService.currentUserSub, (currentUser): ClientMsg => {
    return { t: "auth-state-changed", userId: currentUser?.userId ?? null };
  });
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
  switch (route.t) {
    case "login": {
      return <ViewLoginScreen ctx={ctx} model={model} dispatch={dispatch} />;
    }

    case "login-phone": {
      return (
        <AuthPhone.View
          ctx={ctx}
          model={model.phone}
          dispatch={(m) => dispatch({ t: "phone", c: m })}
        />
      );
    }

    case "login-email-link": {
      return (
        <AuthEmailLink.View
          model={model.emailLink}
          dispatch={(m) => dispatch({ t: "email-link", c: m })}
        />
      );
    }

    case "login-phone-verify": {
      return (
        <AuthPhoneVerify.View
          ctx={ctx}
          phoneNumber={route.phoneNumber}
          model={model.phoneVerify}
          dispatch={(m) => dispatch({ t: "phone-verify", c: m })}
        />
      );
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
      onClose={ctx.back}
      onCancel={ctx.back}
      onConfirm={() => {
        dispatch({ t: "logout" });
      }}
    />
  );
};
