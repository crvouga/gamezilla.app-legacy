import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  APP_SOUND,
  BaseClientCtx,
  ClientCmd,
  playSound,
  pushRoute,
  replaceRoute,
  sendToServer,
  showToast,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import {
  Button,
  ConfirmationDialog,
  IconMobilePhone,
  LoadingState,
} from "gamezilla-app/@CHILD/app/@SHARED/ui"
import { Eff, Sub, batchMsgs, notAsked } from "gamezilla-app/@SHARED/core"
import * as AuthClientSMS from "./@CHILD/auth-sms/auth-sms.client"
import { ClientModule, LogoutMsg, ModelClient, MsgClient } from "./auth.core"
import { ContinueAsGuestClient } from "./continue-as-guest"

//
//
//
// Model
//
//
//

export const init: ClientModule["init"] = async (input) => {
  const sms = await AuthClientSMS.init(input)

  return {
    model: {
      ...ContinueAsGuestClient.initModel,
      currentUser: { t: "loading" },
      loginWithGoogle: notAsked,
      logout: notAsked,
      sms: sms.model,
    },
    eff: Eff.batch([Eff.tag("sms", sms.eff)]),
    msgEvt: batchMsgs(sms.msgEvt),
    msgCmd: batchMsgs(ClientCmd.tag("sms", sms.msgCmd)),
  }
}

//
//
//
// Update
//
//
//

export const update: ClientModule["update"] = (input) => {
  return AppClientModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromServer({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateChild({ ...input, model }),
    (model) => ContinueAsGuestClient.update({ ...input, model }),
  )
}

const updateChild: ClientModule["update"] = async (input) => {
  const updated = await AuthClientSMS.update({
    ctx: input.ctx,
    model: input.model.sms,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgServer: input.msgServer?.t === "sms" ? input.msgServer.c : null,
    msg: input.msg?.t === "sms" ? input.msg.c : null,
  })

  return {
    model: { ...input.model, sms: updated.model },
    msgCmd: ClientCmd.tag("sms", updated.msgCmd),
    eff: Eff.tag("sms", updated.eff),
    msgEvt: updated.msgEvt,
  }
}

const updateFromMsg: ClientModule["update"] = async (input) => {
  if (!input.msg) {
    return { model: input.model }
  }
  const { model, msg } = input
  switch (msg.t) {
    case "logout": {
      return updateFromLogoutMsg({ msg: msg.c, model })
    }

    case "user-clicked-login-with-phone": {
      return {
        model,
        msgCmd: [
          pushRoute({
            n: "auth-login",
            t: "login-sms-request",
          }),
        ],
      }
    }

    default: {
      return { model }
    }
  }
}

const updateFromLogoutMsg = ({
  msg,
  model,
}: {
  msg: LogoutMsg
  model: ModelClient
}): ReturnType<ClientModule["update"]> => {
  const currentUserId =
    model.currentUser.t === "logged-in"
      ? model.currentUser.account.userId
      : null

  if (!currentUserId) {
    return { model }
  }

  switch (msg.t) {
    case "clicked-confirm": {
      return {
        model: {
          ...model,
          currentUser: { t: "logged-out" },
        },
        msgCmd: [
          sendToServer({ t: "logout" }),
          showToast("Logged out"),
          playSound(APP_SOUND.navBackwardMin),
        ],
        msgEvt: [{ t: "auth/unauthenticated" }],
      }
    }

    case "closed":
    case "clicked-cancel": {
      return {
        model: { ...model, logout: notAsked },
        msgCmd: [
          replaceRoute({
            n: "profile",
            t: "profile",
            userId: currentUserId,
          }),
        ],
      }
    }
  }
}

const updateFromServer: ClientModule["update"] = (input) => {
  const { model, msgServer } = input

  switch (msgServer?.t) {
    case "client-unauthenticated": {
      return {
        model: { ...model, currentUser: { t: "logged-out" } },
        msgEvt: [{ t: "auth/unauthenticated" }],
      }
    }

    case "client-authenticated": {
      return {
        model: {
          ...model,
          currentUser: {
            t: "logged-in",
            account: msgServer.account,
          },
        },
        msgEvt: [
          { ...msgServer, account: msgServer.account, t: "auth/authenticated" },
        ],
      }
    }

    default: {
      return { model }
    }
  }
}

const updateFromEvent: ClientModule["update"] = async (input) => {
  return updateRedirect(input)
}

const updateRedirect: ClientModule["update"] = async (input) => {
  if (!input.msgEvt) {
    return { model: input.model }
  }

  const { ctx, msgEvt, model } = input

  switch (msgEvt.t) {
    case "auth/authenticated": {
      if (!msgEvt.loggedIn) {
        return { model }
      }

      const toastMessage =
        msgEvt.account.role === "guest"
          ? ctx.t("auth.logged-in-as-guest")
          : msgEvt.account.phoneNumber
          ? ctx.t("auth.logged-in-with-phone")
          : ctx.t("auth.logged-in")

      return {
        model,
        msgCmd: [
          replaceRoute({ n: "spaces", t: "space-list" }, false),
          playSound(APP_SOUND.celebration),
          showToast(toastMessage),
        ],
      }
    }

    case "routing/route-changed": {
      if (
        model.currentUser.t === "logged-in" &&
        ctx.currentRoute.n === "auth-login"
      ) {
        return {
          model,
          msgCmd: [
            replaceRoute({ n: "spaces", t: "space-list" }),
            showToast("Logged in"),
          ],
        }
      }

      return { model }
    }

    default: {
      return { model }
    }
  }
}

//
//
//
//
//

export const subscriptions: ClientModule["subscriptions"] = async ({
  model,
  ctx,
}) => {
  return Sub.tag(
    "sms",
    await AuthClientSMS.subscriptions({ model: model.sms, ctx }),
  )
}

//
//
//
// View
//
//
//

export const View: ClientModule["View"] = (input) => {
  const { model, ctx, dispatch } = input

  switch (ctx.currentRoute.n) {
    case "auth-logout": {
      switch (ctx.currentRoute.t) {
        case "logout": {
          return <ViewLogoutScreen {...input} />
        }
      }
    }
    case "auth-login": {
      switch (ctx.currentRoute.t) {
        case "login": {
          return <ViewLoginScreen {...input} />
        }
        case "login-sms-request":
        case "login-sms-verify": {
          return (
            <AuthClientSMS.View
              ctx={ctx}
              dispatch={(c) => dispatch({ t: "sms", c })}
              model={model.sms}
            />
          )
        }
      }
    }
    default: {
      return null
    }
  }
}

const ViewLoginScreen: ClientModule["View"] = (input) => {
  const { dispatch, ctx } = input
  return (
    <div className="relative flex h-full w-full flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <div className="flex w-full flex-col items-start justify-center">
          <p className="text-2xl text-neutral-200">
            {ctx.t("auth.sign-in-to")}
          </p>
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
            text={ctx.t("auth.continue-with-phone")}
          />

          <div className="flex w-full items-center justify-center py-1">
            <p className="text-base font-bold uppercase text-neutral-300">
              {ctx.t("auth.or")}
            </p>
          </div>

          <ContinueAsGuestClient.ViewContinueAsGuestButton {...input} />
        </div>
      </div>
    </div>
  )
}

export const ViewLogoutScreen = ({
  model,
  dispatch,
}: {
  ctx: BaseClientCtx
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  if (model.logout?.t === "loading") {
    return <LoadingState />
  }

  const dispatchLogout = (c: LogoutMsg) => dispatch({ t: "logout", c })

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
  )
}
