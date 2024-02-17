import {
  APP_SOUND,
  AnonymousClientCtx,
  AppRoute,
  ClientCmd,
  ClientCtx,
  ClientEvent,
  preloadSound,
} from "gamezilla/@CHILD/app/@SHARED/client"
import {
  IconGamepad,
  IconUserCircle,
  LoadingState,
  Portal,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import {
  Browser,
  Eff,
  Posix,
  Sub,
  batchMsgs,
  toMsgType,
} from "gamezilla/@SHARED/core"
import {
  CODEBASE_VERSION_ID,
  SERVER_IMPL,
  SERVER_URL,
} from "gamezilla/public-config"
import * as AuthClient from "./@CHILD/auth/auth.client"
import * as ProfileClient from "./@CHILD/profile/profile.client"
import * as SpaceClient from "./@CHILD/spaces/spaces.client"
import {
  ClientTransport,
  IClientTransport,
} from "./@CHILD/wire/transport-client"
import * as Wire from "./@CHILD/wire/wire.client"
import { Platform, Routing, Sound, StatusBar, Toast } from "./app-client"
import { ModelClient, MsgClient, MsgToClient, MsgToServer } from "./app.core"
import { VDom } from "gamezilla/@SHARED/vdom"

//
//
//
// Transport
//
//
//

export type Deps = {
  transport: IClientTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
}

export const getDeps = (): Deps => {
  const transport = ClientTransport<MsgToServer, MsgToClient>({
    impl:
      SERVER_IMPL === "node"
        ? {
            t: "socket-io",
            serverUrl: SERVER_URL,
          }
        : {
            t: "web-sockets",

            serverUrl: SERVER_URL,
          },
    codebaseVersionId: CODEBASE_VERSION_ID,
  })
  return {
    transport,
  }
}

//
//
//
//
// Model
//
//
//
//

export const init = async ({
  ctx,
  deps,
}: {
  deps: Deps
  ctx: { now: Posix; location: Browser.Location }
}): Promise<{
  model: ModelClient
  eff?: Eff<MsgClient>
}> => {
  const routing = Routing.init({
    location: ctx.location,
    stored: null,
  })

  const appCtx: ClientCtx | AnonymousClientCtx = {
    currentRoute: routing.model.currentRoute,
    currentUserId: null,
    documentVisibilityState: "visible",
    now: ctx.now,
    profiles: {},
  }

  const toast = await Toast.init({
    stored: null,
    ctx: ctx,
  })

  const wire = await Wire.init({
    stored: null,
  })

  const auth = await AuthClient.init({
    stored: null,
    ctx: appCtx,
  })

  const space = await SpaceClient.init({
    ctx: appCtx,
    stored: null,
  })

  const profile = await ProfileClient.init({
    ctx: { ...appCtx, viewBottomBar: null },
    stored: null,
  })

  const sound = await Sound.init({
    ctx: null,
    stored: null,
  })

  const platform = await Platform.init({
    stored: null,
  })

  const statusBar = await StatusBar.init({
    stored: null,
  })

  const initialModel: ModelClient = {
    statusBar: statusBar.model,
    routing: routing.model,
    toast: toast.model,
    wire: wire.model,
    sound: sound.model,
    platform: platform.model,
    spaces: space.model,
    auth: auth.model,
    profile: profile.model,
  }

  const initialEff = Eff.batch<MsgClient>([
    routing.eff,
    Eff.tag("auth", auth.eff),
  ])

  const initialCmd = batchMsgs<
    ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
  >(
    ClientCmd.tag("spaces", space.msgCmd),
    ClientCmd.tag("profile", profile.msgCmd),
    preloadSound(Object.values(APP_SOUND)),
  )

  const updated = await updateLoop(deps, ctx.now, {
    model: initialModel,
    eff: initialEff,
    msgCmd: initialCmd,
    msgEvt: [],
  })

  return {
    model: updated.model,
    eff: updated.eff,
  }
}

//
//
//
// Update
//
//
//

const SHOULD_LOG = false

function log(...msg: unknown[]) {
  if (SHOULD_LOG) {
    console.log(...msg)
  }
}

export const update = async (input: {
  ctx: { now: Posix }
  msg: MsgClient
  model: ModelClient
  deps: Deps
}): Promise<{
  model: ModelClient
  eff?: Eff<MsgClient>
}> => {
  if (input.msg) {
    log("[msg]", toMsgType(input.msg))
  }
  const msgServer = input.msg.t === "➡️" ? input.msg.c : undefined
  if (msgServer) {
    log("[➡️]", toMsgType(msgServer))
  }
  const updatedFromMsg = await updateChild({
    now: input.ctx.now,
    model: input.model,
    msg: input.msg,
    msgServer: msgServer,
    deps: input.deps,
  })

  const updated = await updateLoop(input.deps, input.ctx.now, updatedFromMsg)

  return updated
}

type Output = {
  model: ModelClient
  eff: Eff<MsgClient>
  msgEvt: ClientEvent[]
  msgCmd: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>[]
}

const updateLoop = async (
  deps: Deps,
  now: Posix,
  acc: Output,
): Promise<Output> => {
  const [msgCmd, ...msgCmdRest] = acc.msgCmd

  if (msgCmd) {
    log("[msgCmd]", toMsgType(msgCmd))
    const updatedCmd = await updateChild({
      deps,
      now,
      model: acc.model,
      msgCmd,
    })
    return updateLoop(deps, now, {
      model: updatedCmd.model,
      msgCmd: [...msgCmdRest, ...updatedCmd.msgCmd],
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
      msgEvt: batchMsgs(acc.msgEvt, updatedCmd.msgEvt),
    })
  }

  const [msgEvt, ...msgEvtRest] = acc.msgEvt

  if (msgEvt) {
    log("[msgEvt]", toMsgType(msgEvt))
    const updatedEvent = await updateChild({
      deps,
      now,
      model: acc.model,
      msgEvt,
    })
    return updateLoop(deps, now, {
      model: updatedEvent.model,
      msgCmd: [...msgCmdRest, ...updatedEvent.msgCmd],
      eff: Eff.batch([acc.eff, updatedEvent.eff]),
      msgEvt: batchMsgs(msgEvtRest, updatedEvent.msgEvt),
    })
  }

  return acc
}

const updateChild = async ({
  now,
  model,
  msg,
  msgServer,
  msgEvt,
  msgCmd,
  deps,
}: {
  deps: Deps
  now: Posix
  model: ModelClient
  msg?: MsgClient
  msgServer?: MsgToClient
  msgEvt?: ClientEvent
  msgCmd?: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
}): Promise<Output> => {
  const ctx = toCtx({ model, ctx: { now } })

  const space = await SpaceClient.update({
    ctx: ctx,
    model: model.spaces,
    msg: msg?.t === "spaces" ? msg.c : null,
    msgServer: msgServer?.t === "spaces" ? msgServer.c : null,
    msgEvt: msgEvt,
    msgCmd: null,
  })

  const profile = await ProfileClient.update({
    ctx: { ...ctx, viewBottomBar: null },
    model: model.profile,
    msg: msg?.t === "profile" ? msg.c : null,
    msgServer: msgServer?.t === "profile" ? msgServer.c : null,
    msgEvt: msgEvt,
    msgCmd: msgCmd?.t === "profile" ? msgCmd : null,
  })

  const auth = await AuthClient.update({
    ctx: ctx,
    model: model.auth,
    msg: msg?.t === "auth" ? msg.c : null,
    msgServer: msgServer?.t === "auth" ? msgServer.c : null,
    msgEvt: msgEvt,
    msgCmd: null,
  })

  const routing = await Routing.update({
    model: model.routing,
    msg: msg?.t === "routing" ? msg.c : null,
    msgCmd: msgCmd?.t === "routing" ? msgCmd : null,
  })

  const wire = await Wire.update({
    model: model.wire,
    msg: msg?.t === "wire" ? msg.c : null,
    msgServer: msgServer?.t === "wire" ? msgServer.c : null,
    msgCmd: msgCmd?.t === "wire" ? msgCmd : null,
    transport: deps.transport,
  })

  const sound = await Sound.update({
    model: model.sound,
    msg: msg?.t === "sound" ? msg.c : null,
    msgCmd: msgCmd?.t === "sound" ? msgCmd : null,
    ctx: null,
  })

  const platform = await Platform.update({
    model: model.platform,
    msg: msg?.t === "platform" ? msg.c : null,
    msgCmd: msgCmd?.t === "platform" ? msgCmd : null,
  })

  const statusBar = await StatusBar.update({
    model: model.statusBar,
    msg: msg?.t === "status-bar" ? msg.c : null,
  })

  const toast = await Toast.update({
    model: model.toast,
    msg: msg?.t === "toast" ? msg.c : null,
    msgCmd: msgCmd?.t === "toast" ? msgCmd : null,
    ctx: ctx,
    msgEvt: null,
    msgServer: null,
  })

  return {
    model: {
      auth: auth.model,
      platform: platform.model,
      profile: profile.model,
      routing: routing.model,
      sound: sound.model,
      spaces: space.model,
      statusBar: statusBar.model,
      toast: toast.model,
      wire: wire.model,
    },

    eff: Eff.batch<MsgClient>([
      Eff.tag("auth", auth.eff),
      Eff.tag("platform", platform.eff),
      Eff.tag("profile", profile.eff),
      Eff.tag("routing", routing.eff),
      Eff.tag("sound", sound.eff),
      Eff.tag("spaces", space.eff),
      Eff.tag("status-bar", statusBar.eff),
      Eff.tag("toast", toast.eff),
      Eff.tag("wire", wire.eff),
    ]),

    msgEvt: batchMsgs<ClientEvent>(
      auth.msgEvt,
      profile.msgEvt,
      routing.msgEvt,
      sound.msgEvt,
      space.msgEvt,
      toast.msgEvt,
      wire.msgEvt,
    ),

    msgCmd: batchMsgs<
      ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
    >(
      ClientCmd.tag("auth", auth.msgCmd),
      ClientCmd.tag("profile", profile.msgCmd),
      ClientCmd.tag("spaces", space.msgCmd),
      routing.msgCmd,
      sound.msgCmd,
      toast.msgCmd,
    ),
  }
}

const toCtx = (input: {
  model: ModelClient
  ctx: { now: Posix }
}): ClientCtx | AnonymousClientCtx => {
  const anonymousCtx: AnonymousClientCtx = {
    profiles: input.model.profile.profiles,
    now: input.ctx.now,
    documentVisibilityState: input.model.platform.documentVisibilityState,
    currentRoute: input.model.routing.currentRoute,
    currentUserId: null,
  }
  if (input.model.auth.currentUser.t === "logged-in") {
    return {
      ...anonymousCtx,
      currentUserId: input.model.auth.currentUser.userId,
    }
  }
  return anonymousCtx
}

//
//
//
//
// Subscriptions
//
//
//
//

export const subscriptions = async (input: {
  ctx: { now: Posix }
  deps: Deps
  model: ModelClient
}) => {
  const { ctx, model } = input

  const ctxApp = toCtx(input)

  return Sub.batch<MsgClient>([
    Sub.tag("➡️", Sub.flat(input.deps.transport.toClient)),
    Sub.tag("wire", Wire.subscriptions({ transport: input.deps.transport })),
    Sub.tag("platform", Platform.subscriptions),
    Sub.tag("routing", Routing.subscriptions),
    Sub.tag("toast", await Toast.subscriptions({ ctx, model: model.toast })),
    Sub.tag(
      "auth",
      await AuthClient.subscriptions({ ctx: ctxApp, model: model.auth }),
    ),
    Sub.tag(
      "spaces",
      await SpaceClient.subscriptions({ ctx: ctxApp, model: model.spaces }),
    ),
  ])
}

//
//
//
// View
//
//
//

export const View = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: { now: Posix }
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  return (
    <div
      className="fixed left-1/2 top-1/2 flex h-[100dvh] w-screen select-none items-center justify-center overflow-hidden bg-black text-white"
      style={{ transform: "translate(-50%, -50%)" }}
    >
      <div className="relative flex h-full max-h-[915px] w-full max-w-[520px] flex-col items-center justify-center overflow-hidden rounded border border-neutral-600">
        <StatusBar.View
          model={model.statusBar}
          dispatch={(c) => dispatch({ t: "status-bar", c })}
          wire={{
            drawer: (
              <Wire.ViewStatusBarDrawer
                model={model.wire}
                dispatch={(c) => dispatch({ t: "wire", c })}
              />
            ),
            statusBar: <Wire.ViewStatusBar model={model.wire} />,
          }}
          sound={{
            drawer: (
              <Sound.ViewStatusBarDrawer
                model={model.sound}
                dispatch={(c) => dispatch({ t: "sound", c })}
              />
            ),
            statusBar: <Sound.ViewStatusBar model={model.sound} />,
          }}
        />

        <div className="flex w-full flex-1 flex-col overflow-hidden">
          <ViewMain model={model} now={ctx.now} dispatch={dispatch} />
        </div>

        <Portal.Exit portalId="modals" />

        <Toast.View
          ctx={ctx}
          model={model.toast}
          dispatch={(c) => dispatch({ t: "toast", c })}
        />
      </div>
    </div>
  )
}

const ViewMain = ({
  model,
  dispatch,
  now,
}: {
  now: Posix
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  switch (model.auth.currentUser.t) {
    case "logged-in": {
      return (
        <ViewLoggedIn
          model={model}
          dispatch={dispatch}
          ctx={{
            now,
            currentRoute: model.routing.currentRoute,
            currentUserId: model.auth.currentUser.userId,
            profiles: model.profile.profiles,
            documentVisibilityState: model.platform.documentVisibilityState,
          }}
        />
      )
    }

    case "logged-out": {
      return (
        <ViewLoggedOut
          dispatch={dispatch}
          model={model}
          ctx={{
            now,
            currentRoute: model.routing.currentRoute,
            profiles: model.profile.profiles,
            documentVisibilityState: model.platform.documentVisibilityState,
          }}
        />
      )
    }

    case "loading": {
      return <LoadingState />
    }
  }
}

const ViewLoggedOut = ({
  model,
  ctx,
  dispatch,
}: {
  model: ModelClient
  dispatch: (m: MsgClient) => void
  ctx: AnonymousClientCtx
}) => {
  switch (model.routing.currentRoute.t) {
    case "auth": {
      return (
        <AuthClient.View
          dispatch={(m) => dispatch({ t: "auth", c: m })}
          model={model.auth}
          ctx={ctx}
        />
      )
    }
    default: {
      return <LoadingState />
    }
  }
}

const ViewLoggedIn = ({
  model,
  ctx,
  dispatch,
}: {
  ctx: ClientCtx
  model: ModelClient
  dispatch: (m: MsgClient) => void
}) => {
  switch (model.routing.currentRoute.t) {
    case "chat": {
      return null
    }

    case "spaces": {
      return (
        <SpaceClient.View
          dispatch={(m) => dispatch({ t: "spaces", c: m })}
          model={model.spaces}
          ctx={ctx}
          viewBottomBar={
            <ViewBottomBar model={model} dispatch={dispatch} ctx={ctx} />
          }
        />
      )
    }

    case "profile": {
      return (
        <ProfileClient.View
          dispatch={(m) => dispatch({ t: "profile", c: m })}
          model={model.profile}
          ctx={{
            ...ctx,
            viewBottomBar: (
              <ViewBottomBar model={model} dispatch={dispatch} ctx={ctx} />
            ),
          }}
        />
      )
    }

    case "search": {
      return null
    }

    case "logout": {
      return (
        <AuthClient.ViewLogoutScreen
          dispatch={(m) => dispatch({ t: "auth", c: m })}
          ctx={ctx}
          model={model.auth}
        />
      )
    }

    case "auth": {
      return <LoadingState />
    }
  }
}

const ViewBottomBar = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: ClientCtx
  model: ModelClient
  dispatch: (m: MsgClient) => void
}) => {
  const items: {
    route: AppRoute
    label: string
    icon: VDom
  }[] = [
    {
      route: {
        t: "spaces",
        c: { t: "space-list" },
      },
      label: "Spaces",
      icon: <IconGamepad className="h-6 w-6" />,
    },
    {
      route: {
        t: "profile",
        c: { t: "profile", userId: ctx.currentUserId },
      },
      label: "Profile",
      icon: <IconUserCircle className="h-6 w-6" />,
    },
  ]

  return (
    <div className="flex w-full shrink-0 flex-col items-center justify-center">
      <SpaceClient.ViewCurrentSpaceBar
        ctx={ctx}
        model={model.spaces}
        dispatch={(c) => dispatch({ t: "spaces", c })}
      />
      <div className="flex w-full items-center justify-center border-t border-neutral-600">
        {items.map((item, index) => {
          const isSelected = AppRoute.eq(model.routing.currentRoute, item.route)

          return (
            <button
              key={AppRoute.encode(item.route)}
              onClick={() =>
                dispatch({
                  t: "routing",
                  c: { t: "clicked-link", route: item.route },
                })
              }
              className={cn(
                "flex flex-1 flex-col items-center justify-center pb-2 pt-1",
                isSelected ? "text-blue-500" : "text-opacity-50",
                index < items.length - 1 ? "border-r border-neutral-600" : "",
              )}
            >
              {item.icon}
              <div className="mt-0.5 text-xs text-inherit">{item.label}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
