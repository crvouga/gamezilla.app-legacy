import {
  APP_SOUND,
  BaseClientCtx,
  playSound,
  sendToServer,
  showToast,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { ConfirmationDrawer } from "gamezilla-app/@CHILD/app/@SHARED/ui"
import { notAsked, ok } from "gamezilla-app/@SHARED/core"
import { ClientModule, ModelClient, MsgClient } from "../auth.core"

//
//
//
//
//
//
//

const update: ClientModule["update"] = ({ msg, model, msgCmd, msgEvt }) => {
  switch (msg?.t) {
    case "logout-drawer.clicked-confirm": {
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

    case "logout-drawer.closed":
    case "logout-drawer.clicked-cancel": {
      const currentUserId =
        model.currentUser.t === "logged-in"
          ? model.currentUser.account.userId
          : null

      if (!currentUserId) {
        return { model }
      }

      return {
        model: {
          ...model,
          logout: notAsked,
          opened: null,
        },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }
  }

  switch (msgCmd?.c.t) {
    case "logout": {
      return {
        model: {
          ...model,
          opened: "logged-out",
        },
        msgCmd: [playSound(APP_SOUND.alertErrorSm)],
      }
    }
  }

  switch (msgEvt?.t) {
    case "auth/unauthenticated": {
      return {
        model: {
          ...model,
          logout: ok(null),
          opened: null,
        },
      }
    }
  }

  return { model }
}

//
//
//
//
//
//
//

const View = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: BaseClientCtx
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  return (
    <ConfirmationDrawer
      open={model.opened === "logged-out"}
      title={ctx.t("auth.logout-of-gamezill.app")}
      body={ctx.t("auth.logout-of-gamezill.app-body")}
      confirmText="Logout"
      id="logout"
      confirmLoading={model.logout.t === "loading"}
      position="bottom"
      onClose={() => dispatch({ t: "logout-drawer.closed" })}
      onCancel={() => dispatch({ t: "logout-drawer.clicked-cancel" })}
      onConfirm={() => dispatch({ t: "logout-drawer.clicked-confirm" })}
    />
  )
}

export const LogoutClient = {
  View,
  update,
}
