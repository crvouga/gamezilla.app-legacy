import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import {
  APP_SOUND,
  AnonymousClientCtx,
  ClientCmd,
  ClientEvent,
  playSound,
  pushRoute,
  replaceRoute,
  sendToServer,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Button,
  ConfirmationDialog,
  IconMobilePhone,
  LoadingState,
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
  InEvent: ClientEvent;
  OutCmd: ClientCmd<{
    ClientMsg: ClientMsg;
    ToServer: ToServer;
  }>;
  OutEvent: ClientEvent;
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
      msgEvent: sms.msgEvent,
      msgCmd: ClientCmd.tag("sms", sms.msgCmd),
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
    msgEvent: sms.msgEvent,
    msgCmd: ClientCmd.tag("sms", sms.msgCmd),
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
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateChild({ ...input, model })
  );
};

const updateChild: Client["update"] = async (input) => {
  const updated = await AuthClientSMS.update({
    ctx: input.ctx,
    model: input.model.sms,
    msgCmd: input.msgCmd,
    msgEvent: input.msgEvent,
    msgFromServer:
      input.msgFromServer?.t === "sms" ? input.msgFromServer.c : null,
    msg: input.msg?.t === "sms" ? input.msg.c : null,
  });

  return {
    model: { ...input.model, sms: updated.model },
    msgCmd: ClientCmd.tag("sms", updated.msgCmd),
    eff: Eff.tag("sms", updated.eff),
    msgEvent: updated.msgEvent,
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
        msgCmd: [
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
        msgCmd: [sendToServer({ t: "logout" }), showToast("Logged out")],
        msgEvent: [{ t: "is-logged-out" }],
      };
    }

    case "closed":
    case "clicked-cancel": {
      return {
        model: { ...model, logout: notAsked },
        msgCmd: [
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
  if (!input.msgFromServer) {
    return { model: input.model };
  }

  const { model, msgFromServer } = input;

  switch (msgFromServer.t) {
    case "client-unauthenticated": {
      return {
        model: { ...model, currentUser: { t: "logged-out" } },
        msgEvent: [{ t: "is-logged-out" }],
      };
    }

    case "client-authenticated": {
      return {
        model: {
          ...model,
          currentUser: {
            t: "logged-in",
            userId: msgFromServer.userId,
          },
        },
        msgEvent: [{ ...msgFromServer, t: "is-logged-in" }],
      };
    }

    case "sms": {
      return { model };
    }
  }
};

const updateFromEvent: Client["update"] = async (input) => {
  return updateRedirect(input);
};

const updateRedirect: Client["update"] = async (input) => {
  if (!input.msgEvent) {
    return { model: input.model };
  }

  const { ctx, msgEvent, model } = input;

  switch (msgEvent.t) {
    case "is-logged-in": {
      if (ctx.currentRoute.t === "auth") {
        return {
          model,
          msgCmd: [
            replaceRoute({
              t: "spaces",
              c: { t: "space-list" },
            }),
            playSound(APP_SOUND.navForward),
          ],
        };
      }

      return { model };
    }

    case "is-logged-out": {
      if (ctx.currentRoute.t !== "auth") {
        return {
          model,
          msgCmd: [
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
      if (model.currentUser.t === "logged-in" && msgEvent.route.t === "auth") {
        return {
          model,
          msgCmd: [
            replaceRoute({
              t: "spaces",
              c: { t: "space-list" },
            }),
            showToast("Logged in"),
          ],
        };
      }

      if (model.currentUser.t === "logged-out" && msgEvent.route.t !== "auth") {
        return {
          model,
          msgCmd: [
            replaceRoute({
              t: "auth",
              c: { t: "login" },
            }),
            showToast("Logged out"),
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
    <div className="relative flex h-full w-full flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <div className="flex w-full flex-col items-start justify-center">
          <p className="text-2xl text-neutral-200">Sign in to</p>
          <h1 className="bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text pb-2 text-5xl font-extrabold text-transparent">
            gamezilla.app
          </h1>
        </div>

        <div className="flex w-full flex-col gap-6">
          <Button
            onClick={() => dispatch({ t: "user-clicked-login-with-phone" })}
            size="lg"
            className="w-full"
            start={<IconMobilePhone className="h-6 w-6" />}
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
    return <LoadingState />;
  }

  const dispatchLogout = (c: LogoutMsg) => dispatch({ t: "logout", c });

  return (
    <div className="relative h-full w-full flex-1">
      <ConfirmationDialog
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
