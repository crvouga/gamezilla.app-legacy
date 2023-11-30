import {
  APP_SOUND,
  AnonymousClientCtx,
  AnonymousViewCtx,
  RouteAuth,
  playSound,
  replaceRoute,
  sendToServer,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Button,
  ConformationDialog,
  IconEnvelope,
  IconMobilePhone,
  LoadingBar,
  LoadingScreen,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub, notAsked } from "gamezilla/@SHARED/core";
import { AppClient } from "../../@SHARED/architecture";
import * as AuthClientSMS from "./@CHILD/auth-sms/auth-sms.client";
import {
  ClientModel,
  ClientMsg,
  LogoutMsg,
  ToClient,
  ToServer,
} from "./auth.core";

//
//
//
//
//
//
//

type Client = AppClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  ViewCtx: AnonymousViewCtx & { route: RouteAuth };
  ClientCtx: AnonymousClientCtx;
  Cmd: never;
}>;

//
//
//
// Model
//
//
//

export const init: Client["init"] = ({ stored, ctx }) => {
  const sms = AuthClientSMS.init({
    stored: stored?.sms ?? null,
    ctx,
  });

  if (stored) {
    return {
      model: { ...stored, sms: sms.model },
      eff: Eff.t("sms", sms.eff),
      msg: AppClient.tagOutMsgs("sms", sms.msg),
    };
  }

  return {
    model: {
      currentUser: { t: "loading" },
      loginWithGoogle: notAsked,
      logout: notAsked,
      sms: sms.model,
    },
    eff: Eff.t("sms", sms.eff),
    msg: AppClient.tagOutMsgs("sms", sms.msg),
  };
};

//
//
//
// Update
//
//
//

export const update: Client["update"] = (input) => {
  return AppClient.chain(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromServer({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateChild({ ...input, model })
  );
};

const updateChild: Client["update"] = (input) => {
  const { msg, model, ctx } = input;

  if (msg.t === "sms" || msg.variant === "evt") {
    const updated = AuthClientSMS.update({
      ctx,
      model: model.sms,
      msg:
        msg.variant === "evt"
          ? msg
          : msg.variant === "from-server"
          ? { ...msg.c, variant: "from-server" }
          : { ...msg.c, variant: "msg" },
    });

    return {
      model: {
        ...model,
        sms: updated.model,
      },
      eff: Eff.t("sms", updated.eff),
      msg: AppClient.tagOutMsgs("sms", updated.msg),
    };
  }

  return { model };
};

const updateFromMsg: Client["update"] = (input) => {
  const { msg, model } = input;

  if (msg.variant !== "msg") {
    return { model };
  }

  switch (msg.t) {
    case "logout": {
      return updateFromLogoutMsg({ msg: msg.c, model });
    }

    case "sms": {
      return { model };
    }
  }
};

const updateFromLogoutMsg = ({
  msg,
  model,
}: {
  msg: LogoutMsg;
  model: ClientModel;
}): ReturnType<Client["update"]> => {
  const currentUserId =
    model.currentUser.t === "logged-in" ? model.currentUser.userId : null;

  if (!currentUserId) {
    return { model };
  }

  switch (msg.t) {
    case "clicked-confirm": {
      return {
        model: {
          ...model,
          currentUser: { t: "logged-out" },
        },
        msg: [
          sendToServer({ t: "logout" }),
          showToast("Logged out"),
          { t: "auth/client-unauthenticated", variant: "evt" },
        ],
      };
    }

    case "closed":
    case "clicked-cancel": {
      return {
        model: { ...model, logout: notAsked },
        msg: [
          replaceRoute({
            t: "profile",
            c: { t: "profile", userId: currentUserId },
          }),
        ],
      };
    }
  }
};

const updateFromServer: Client["update"] = (input) => {
  const { msg, model } = input;

  if (msg.variant !== "from-server") {
    return { model };
  }

  switch (msg.t) {
    case "auth/client-unauthenticated": {
      return {
        model: { ...model, currentUser: { t: "logged-out" } },
        msg: [{ ...msg, variant: "evt" }],
      };
    }

    case "auth/client-authenticated": {
      return {
        model: {
          ...model,
          currentUser: {
            t: "logged-in",
            userId: msg.userId,
          },
        },
        msg: [{ ...msg, variant: "evt" }],
      };
    }

    default: {
      return { model };
    }
  }
};

export const updateFromEvent: Client["update"] = (input) => {
  const { model, msg } = input;

  if (msg.variant !== "evt") {
    return { model };
  }

  return AppClient.chain({ model }, (model) =>
    handleRedirect({ ...input, model })
  );
};

export const handleRedirect: Client["update"] = (input) => {
  const { model, msg, ctx } = input;

  if (msg.variant !== "evt") {
    return { model };
  }

  switch (msg.t) {
    case "auth/client-authenticated": {
      if (ctx.currentRoute.t === "auth") {
        return {
          model,
          msg: [
            replaceRoute({ t: "space", c: { t: "space-list" } }),
            playSound(APP_SOUND.navForward),
          ],
        };
      }

      return { model };
    }

    case "auth/client-unauthenticated": {
      if (ctx.currentRoute.t !== "auth") {
        return {
          model,
          msg: [
            replaceRoute({ t: "auth", c: { t: "login" } }),
            playSound(APP_SOUND.navBackward),
          ],
        };
      }

      return { model };
    }

    case "routing/route-changed": {
      if (model.currentUser.t === "logged-in" && msg.route.t === "auth") {
        return {
          model,
          msg: [replaceRoute({ t: "space", c: { t: "space-list" } })],
        };
      }

      if (model.currentUser.t === "logged-out" && msg.route.t !== "auth") {
        return {
          model,
          msg: [replaceRoute({ t: "auth", c: { t: "login" } })],
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

export const subscriptions: Client["subscriptions"] = ({
  intervalId,
  model,
  ctx,
}) => {
  return Sub.tag(
    "sms",
    AuthClientSMS.subscriptions({
      model: model.sms,
      intervalId: `${intervalId}/sms`,
      ctx,
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

export const View: Client["View"] = ({ model, ctx, dispatch }) => {
  switch (ctx.route.t) {
    case "login": {
      return <ViewLoginScreen ctx={ctx} model={model} dispatch={dispatch} />;
    }

    case "login-phone-verify":
    case "login-phone": {
      return (
        <AuthClientSMS.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "sms", c })}
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
}: {
  ctx: AnonymousViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  if (model.logout?.t === "loading") {
    return <LoadingScreen />;
  }

  const dispatchLogout = (c: LogoutMsg) => dispatch({ t: "logout", c });

  return (
    <div class="relative h-full w-full flex-1">
      <ConformationDialog
        open
        title="Logout of Gamezilla?"
        confirmTitle="Logout"
        onClose={() => dispatchLogout({ t: "closed" })}
        onCancel={() => dispatchLogout({ t: "clicked-cancel" })}
        onConfirm={() => dispatchLogout({ t: "clicked-confirm" })}
      />
    </div>
  );
};
