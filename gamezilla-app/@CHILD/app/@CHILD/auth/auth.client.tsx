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
import { ProfileRoutes } from "../profile/profile.routes"
import { SpacesRoutes } from "../spaces/@SHARED/space.routes"
import * as AuthClientSMS from "./@CHILD/auth-sms/auth-sms.client"
import { AuthRoutes } from "./@SHARED/auth.routes"
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
        msgCmd: [pushRoute(AuthRoutes.LoginSMSRequest())],
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
    model.currentUser.t === "logged-in" ? model.currentUser.userId : null

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
          playSound(APP_SOUND.navBackward),
        ],
        msgEvt: [{ t: "auth/unauthenticated" }],
      }
    }

    case "closed":
    case "clicked-cancel": {
      return {
        model: { ...model, logout: notAsked },
        msgCmd: [
          replaceRoute(ProfileRoutes.Profile({ userId: currentUserId })),
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
            userId: msgServer.userId,
          },
        },
        msgEvt: [{ ...msgServer, t: "auth/authenticated" }],
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
      if (AuthRoutes.is(ctx.currentRouteV2)) {
        return {
          model,
          msgCmd: [
            replaceRoute(SpacesRoutes.SpaceList()),
            playSound(APP_SOUND.navForward),
          ],
        }
      }

      return { model }
    }

    case "auth/unauthenticated": {
      return {
        model,
        msgCmd: [replaceRoute(AuthRoutes.Login())],
      }
    }

    case "routing/route-changed": {
      if (
        model.currentUser.t === "logged-in" &&
        AuthRoutes.is(ctx.currentRouteV2) &&
        !AuthRoutes.Logout.is(ctx.currentRouteV2)
      ) {
        return {
          model,
          msgCmd: [
            replaceRoute(SpacesRoutes.SpaceList()),
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

  if (AuthRoutes.Logout.is(ctx.currentRouteV2)) {
    return <ViewLogoutScreen {...input} />
  }

  if (AuthRoutes.Login.is(ctx.currentRouteV2)) {
    return <ViewLoginScreen {...input} />
  }

  if (
    AuthRoutes.LoginSMSRequest.is(ctx.currentRouteV2) ||
    AuthRoutes.LoginSMSVerify.is(ctx.currentRouteV2)
  ) {
    return (
      <AuthClientSMS.View
        ctx={ctx}
        dispatch={(c) => dispatch({ t: "sms", c })}
        model={model.sms}
      />
    )
  }

  return null
}

const ViewLoginScreen: ClientModule["View"] = (input) => {
  const { dispatch } = input
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
            text="Continue with phone"
          />

          <div className="flex w-full items-center justify-center py-1">
            <p className="text-base font-bold text-neutral-300">OR</p>
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
