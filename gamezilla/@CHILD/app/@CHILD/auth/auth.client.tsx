import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import {
  APP_SOUND,
  AnonymousClientCtx,
  ClientCmd,
  ClientEvt,
  playSound,
  pushRoute,
  replaceRoute,
  sendToServer,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Button,
  ConformationDialog,
  IconMobilePhone,
  LoadingScreen,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub, notAsked } from "gamezilla/@SHARED/core";
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

type Client = AppClientModule<{
  Model: ClientModel;
  Msg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  Ctx: AnonymousClientCtx;
  InCmd: never;
  InEvt: ClientEvt;
  OutCmd: ClientCmd<{
    ClientMsg: ClientMsg;
    ToServer: ToServer;
  }>;
  OutEvt: ClientEvt;
}>;

//
//
//
// Model
//
//
//

export const init: Client["init"] = async ({ stored, ctx }) => {
  const sms = await AuthClientSMS.init({
    stored: stored?.sms ?? null,
    ctx,
  });

  if (stored) {
    return {
      model: { ...stored, sms: sms.model },
      eff: Eff.tag("sms", sms.eff),
      evt: sms.evt,
      cmd: ClientCmd.tag("sms", sms.cmd),
    };
  }

  return {
    model: {
      currentUser: { t: "loading" },
      loginWithGoogle: notAsked,
      logout: notAsked,
      sms: sms.model,
    },
    eff: Eff.tag("sms", sms.eff),
    evt: sms.evt,
    cmd: ClientCmd.tag("sms", sms.cmd),
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
  return AppClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromServer({ ...input, model }),
    (model) => updateFromEvt({ ...input, model }),
    (model) => updateChild({ ...input, model })
  );
};

const updateChild: Client["update"] = async (input) => {
  const updated = await AuthClientSMS.update({
    ctx: input.ctx,
    model: input.model.sms,
    cmd: input.cmd,
    evt: input.evt,
    fromServer: input.fromServer?.t === "sms" ? input.fromServer.c : null,
    msg: input.msg?.t === "sms" ? input.msg.c : null,
  });

  return {
    model: { ...input.model, sms: updated.model },
    cmd: ClientCmd.tag("sms", updated.cmd),
    eff: Eff.tag("sms", updated.eff),
    evt: updated.evt,
  };
};

const updateFromMsg: Client["update"] = async (input) => {
  if (!input.msg) {
    return { model: input.model };
  }
  const { model, msg } = input;
  switch (msg.t) {
    case "logout": {
      return updateFromLogoutMsg({ msg: msg.c, model });
    }

    case "user-clicked-login-with-phone": {
      return {
        model,
        cmd: [
          pushRoute({
            t: "auth",
            c: { t: "login-phone", isSelectingCountry: false },
          }),
        ],
      };
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
        cmd: [sendToServer({ t: "logout" }), showToast("Logged out")],
        evt: [{ t: "auth/client-unauthenticated" }],
      };
    }

    case "closed":
    case "clicked-cancel": {
      return {
        model: { ...model, logout: notAsked },
        cmd: [
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
  if (!input.fromServer) {
    return { model: input.model };
  }

  const { model, fromServer } = input;

  switch (fromServer.t) {
    case "auth/client-unauthenticated": {
      return {
        model: { ...model, currentUser: { t: "logged-out" } },
        evt: [fromServer],
      };
    }

    case "auth/client-authenticated": {
      return {
        model: {
          ...model,
          currentUser: {
            t: "logged-in",
            userId: fromServer.userId,
          },
        },
        evt: [fromServer],
      };
    }

    case "sms": {
      return { model };
    }
  }
};

const updateFromEvt: Client["update"] = async (input) => {
  return updateRedirect(input);
};

const updateRedirect: Client["update"] = async (input) => {
  if (!input.evt) {
    return { model: input.model };
  }

  const { ctx, evt, model } = input;

  switch (evt.t) {
    case "auth/client-authenticated": {
      if (ctx.currentRoute.t === "auth") {
        return {
          model,
          cmd: [
            replaceRoute({
              t: "space",
              c: { t: "space-list" },
            }),
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
          cmd: [
            replaceRoute({
              t: "auth",
              c: { t: "login" },
            }),
            playSound(APP_SOUND.navBackward),
          ],
        };
      }

      return { model };
    }

    case "routing/route-changed": {
      if (model.currentUser.t === "logged-in" && evt.route.t === "auth") {
        return {
          model,
          cmd: [
            replaceRoute({
              t: "space",
              c: { t: "space-list" },
            }),
          ],
        };
      }

      if (model.currentUser.t === "logged-out" && evt.route.t !== "auth") {
        return {
          model,
          cmd: [
            replaceRoute({
              t: "auth",
              c: { t: "login" },
            }),
          ],
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

export const subscriptions: Client["subscriptions"] = ({ model, ctx }) => {
  return Sub.tag("sms", AuthClientSMS.subscriptions({ model: model.sms, ctx }));
};

//
//
//
// View
//
//
//

export const View: Client["View"] = ({ model, ctx, dispatch }) => {
  if (ctx.currentRoute.t !== "auth") {
    return null;
  }
  const route = ctx.currentRoute.c;
  switch (route.t) {
    case "login": {
      return <ViewLoginScreen dispatch={dispatch} />;
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
  dispatch,
}: {
  dispatch: (msg: ClientMsg) => void;
}) => {
  return (
    <div class="relative flex h-full w-full flex-1 flex-col">
      <div class="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <div class="flex w-full flex-col items-start justify-center">
          <p class="text-2xl text-neutral-200">Sign in to</p>
          <h1 class="bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text pb-2 text-5xl font-extrabold text-transparent">
            gamezilla.app
          </h1>
        </div>

        <div class="flex w-full flex-col gap-6">
          <Button
            onClick={() => dispatch({ t: "user-clicked-login-with-phone" })}
            size="lg"
            class="w-full"
            start={<IconMobilePhone class="h-6 w-6" />}
            text="Continue With Phone"
          />
        </div>
      </div>
    </div>
  );
};

export const ViewLogoutScreen = ({
  model,
  dispatch,
}: {
  ctx: AnonymousClientCtx;
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
