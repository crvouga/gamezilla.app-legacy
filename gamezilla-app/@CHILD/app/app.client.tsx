import {
  APP_SOUND,
  AnonymousClientCtx,
  AppRoute,
  ClientCmd,
  ClientCtx,
  ClientEvent,
  isAnonymous,
  preloadSound,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import {
  IconGamepad,
  IconUserCircle,
  Portal,
  cn,
} from "gamezilla-app/@CHILD/app/@SHARED/ui"
import {
  Browser,
  Eff,
  Posix,
  Sub,
  batchMsgs,
  toMsgType,
} from "gamezilla-app/@SHARED/core"
import { LanguageCodeISO_639_1 } from "gamezilla-app/@SHARED/l18n"
import { VDom } from "gamezilla-app/@SHARED/vdom"
import {
  CODEBASE_VERSION_ID,
  SERVER_IMPL,
  SERVER_URL,
} from "gamezilla-app/public-config"
import * as AuthClient from "./@CHILD/auth/auth.client"
import * as LangClient from "./@CHILD/lang/lang.client"
import * as ProfileClient from "./@CHILD/profile/profile.client"
import * as SpaceClient from "./@CHILD/spaces/spaces.client"
import {
  ClientTransport,
  IClientTransport,
} from "./@CHILD/wire/transport-client"
import * as Wire from "./@CHILD/wire/wire.client"
import { getTranslator } from "./@SHARED/client/translator"
import { Platform, Routing, Sound, StatusBar, Toast } from "./app-client"
import { ModelClient, MsgClient, MsgToClient, MsgToServer } from "./app.core"

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
  stored: Record<string, unknown>
}

export const getDeps = async (): Promise<Deps> => {
  const transport = await ClientTransport<MsgToServer, MsgToClient>({
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

  const stored: Record<string, unknown> = {}

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) {
      continue
    }
    const value = localStorage.getItem(key)
    try {
      stored[key] = value ? JSON.parse(value) : value
    } catch (error) {
      stored[key] = value
    }
  }

  return {
    transport,
    stored,
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

type Ctx = {
  now: Posix
  location: Browser.Location
  navigatorLanguage: LanguageCodeISO_639_1
}

export const getCtx = (): Ctx => {
  return {
    now: Posix.now(),
    location: Browser.location(),
    navigatorLanguage: LanguageCodeISO_639_1.getLangFromNavigator() ?? "en",
  }
}

export const init = async (input: {
  deps: Deps
  ctx: Ctx
}): Promise<{
  model: ModelClient
  eff?: Eff<MsgClient>
}> => {
  const routing = Routing.init({
    location: input.ctx.location,
  })

  const ctx: AnonymousClientCtx = {
    ...input.ctx,
    t: getTranslator(input.ctx.navigatorLanguage),
    currentRoute: routing.model.currentRoute,
    currentUserId: null,
    documentVisibilityState: "visible",
    profiles: {},
  }

  const lang = await LangClient.init({
    ctx,
    stored: input.deps.stored,
  })

  const toast = await Toast.init({
    stored: input.deps.stored,
    ctx,
  })

  const wire = await Wire.init({
    stored: input.deps.stored,
  })

  const auth = await AuthClient.init({
    stored: input.deps.stored,
    ctx,
  })

  const space = await SpaceClient.init({
    ctx,
    stored: input.deps.stored,
  })

  const profile = await ProfileClient.init({
    ctx: { ...ctx, viewBottomBar: null },
    stored: input.deps.stored,
  })

  const sound = await Sound.init({
    ctx: null,
    stored: input.deps.stored,
  })

  const platform = await Platform.init({
    stored: input.deps.stored,
  })

  const statusBar = await StatusBar.init({
    stored: input.deps.stored,
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
    lang: lang.model,
  }

  const initialEff = Eff.batch<MsgClient>([
    routing.eff,
    Eff.tag("auth", auth.eff),
    Eff.tag("lang", lang.eff),
  ])

  const initialCmd = batchMsgs<
    ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
  >(
    ClientCmd.tag("spaces", space.msgCmd),
    ClientCmd.tag("profile", profile.msgCmd),
    ClientCmd.tag("auth", auth.msgCmd),
    ClientCmd.tag("lang", lang.msgCmd),
    preloadSound(Object.values(APP_SOUND)),
  )

  const updated = await updateLoop(input.deps, input.ctx, {
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
  ctx: Ctx
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
    ctx: input.ctx,
    model: input.model,
    msg: input.msg,
    msgServer: msgServer,
    deps: input.deps,
  })

  const updated = await updateLoop(input.deps, input.ctx, updatedFromMsg)

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
  ctx: Ctx,
  acc: Output,
): Promise<Output> => {
  const [msgCmd, ...msgCmdRest] = acc.msgCmd

  if (msgCmd) {
    log("[msgCmd]", toMsgType(msgCmd))
    const updatedCmd = await updateChild({
      deps,
      ctx,
      model: acc.model,
      msgCmd,
    })
    return updateLoop(deps, ctx, {
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
      ctx,
      model: acc.model,
      msgEvt,
    })
    return updateLoop(deps, ctx, {
      model: updatedEvent.model,
      msgCmd: [...msgCmdRest, ...updatedEvent.msgCmd],
      eff: Eff.batch([acc.eff, updatedEvent.eff]),
      msgEvt: batchMsgs(msgEvtRest, updatedEvent.msgEvt),
    })
  }

  return acc
}

const updateChild = async ({
  ctx,
  model,
  msg,
  msgServer,
  msgEvt,
  msgCmd,
  deps,
}: {
  deps: Deps
  ctx: Ctx
  model: ModelClient
  msg?: MsgClient
  msgServer?: MsgToClient
  msgEvt?: ClientEvent
  msgCmd?: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
}): Promise<Output> => {
  const clientClient = toClientCtx({ model, ctx })

  const space = await SpaceClient.update({
    ctx: clientClient,
    model: model.spaces,
    msg: msg?.t === "spaces" ? msg.c : null,
    msgServer: msgServer?.t === "spaces" ? msgServer.c : null,
    msgEvt: msgEvt,
    msgCmd: null,
  })

  const profile = await ProfileClient.update({
    ctx: { ...clientClient, viewBottomBar: null },
    model: model.profile,
    msg: msg?.t === "profile" ? msg.c : null,
    msgServer: msgServer?.t === "profile" ? msgServer.c : null,
    msgEvt: msgEvt,
    msgCmd: msgCmd?.t === "profile" ? msgCmd : null,
  })

  const auth = await AuthClient.update({
    ctx: clientClient,
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
    msgCmd: msgCmd?.t === "status-bar" ? msgCmd : null,
  })

  const toast = await Toast.update({
    model: model.toast,
    msg: msg?.t === "toast" ? msg.c : null,
    msgCmd: msgCmd?.t === "toast" ? msgCmd : null,
    ctx,
    msgEvt: null,
    msgServer: null,
  })

  const lang = await LangClient.update({
    model: model.lang,
    msg: msg?.t === "lang" ? msg.c : null,
    msgCmd: null,
    msgServer: msgServer?.t === "lang" ? msgServer.c : null,
    msgEvt: msgEvt,
    ctx: clientClient,
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
      lang: lang.model,
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
      Eff.tag("lang", lang.eff),
    ]),

    msgEvt: batchMsgs<ClientEvent>(
      auth.msgEvt,
      profile.msgEvt,
      routing.msgEvt,
      sound.msgEvt,
      space.msgEvt,
      toast.msgEvt,
      wire.msgEvt,
      lang.msgEvt,
    ),

    msgCmd: batchMsgs<
      ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
    >(
      ClientCmd.tag("auth", auth.msgCmd),
      ClientCmd.tag("profile", profile.msgCmd),
      ClientCmd.tag("spaces", space.msgCmd),
      ClientCmd.tag("lang", lang.msgCmd),
      routing.msgCmd,
      sound.msgCmd,
      toast.msgCmd,
    ),
  }
}

const toClientCtx = (input: {
  model: ModelClient
  ctx: Ctx
}): ClientCtx | AnonymousClientCtx => {
  const anonymousCtx: AnonymousClientCtx = {
    ...input.ctx,
    t: getTranslator(input.model.lang.lang),
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
  ctx: Ctx
  deps: Deps
  model: ModelClient
}) => {
  const ctx = toClientCtx(input)

  return Sub.batch<MsgClient>([
    Sub.tag("➡️", Sub.flat(input.deps.transport.toClient)),
    Sub.tag("wire", Wire.subscriptions({ transport: input.deps.transport })),
    Sub.tag("platform", Platform.subscriptions),
    Sub.tag("routing", Routing.subscriptions),
    Sub.tag(
      "lang",
      await LangClient.subscriptions({ ctx, model: input.model.lang }),
    ),
    Sub.tag(
      "toast",
      await Toast.subscriptions({ ctx, model: input.model.toast }),
    ),
    Sub.tag(
      "auth",
      await AuthClient.subscriptions({ ctx, model: input.model.auth }),
    ),
    Sub.tag(
      "spaces",
      await SpaceClient.subscriptions({ ctx, model: input.model.spaces }),
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

export const View = (input: {
  ctx: Ctx
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  const { ctx, dispatch, model } = input
  const clientCtx = toClientCtx({ model, ctx })

  return (
    <div
      className="fixed left-1/2 top-1/2 flex h-[100dvh] w-screen select-none items-center justify-center overflow-hidden bg-black text-white"
      style={{ transform: "translate(-50%, -50%)" }}
    >
      <div className="relative flex h-full max-h-[915px] w-full max-w-[520px] flex-col items-center justify-center overflow-hidden rounded border border-neutral-600">
        <ViewStatusBar model={model} dispatch={dispatch} ctx={ctx} />

        <div className="flex w-full flex-1 flex-col overflow-hidden">
          <ProfileClient.View
            dispatch={(m) => dispatch({ t: "profile", c: m })}
            model={model.profile}
            ctx={{
              ...clientCtx,
              viewBottomBar: (
                <ViewBottomNavBar
                  model={model}
                  dispatch={dispatch}
                  ctx={clientCtx}
                />
              ),
            }}
          />

          <SpaceClient.View
            dispatch={(m) => dispatch({ t: "spaces", c: m })}
            model={model.spaces}
            ctx={clientCtx}
            slots={{
              bottomBar() {
                return (
                  <ViewBottomNavBar
                    model={model}
                    dispatch={dispatch}
                    ctx={clientCtx}
                  />
                )
              },
            }}
          />

          <AuthClient.View
            dispatch={(c) => dispatch({ t: "auth", c })}
            model={model.auth}
            ctx={clientCtx}
          />

          <LangClient.View
            ctx={clientCtx}
            model={model.lang}
            dispatch={(c) => dispatch({ t: "lang", c })}
          />
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

export const ViewStatusBar: typeof View = ({ ctx, dispatch, model }) => {
  const clientCtx = toClientCtx({ model, ctx })

  return (
    <StatusBar.View
      model={model.statusBar}
      dispatch={(c) => dispatch({ t: "status-bar", c })}
      slots={{
        barLeft: (
          <>
            <Wire.ViewStatusBar model={model.wire} />
          </>
        ),

        barRight: (
          <>
            <Sound.ViewStatusBar model={model.sound} />
          </>
        ),

        drawerContent: (
          <>
            <Wire.ViewStatusBarDrawer
              model={model.wire}
              dispatch={(c) => dispatch({ t: "wire", c })}
            />

            <LangClient.ViewStatusBarDrawer
              ctx={clientCtx}
              dispatch={(c) => dispatch({ t: "lang", c })}
              model={model.lang}
            />

            <Sound.ViewStatusBarDrawer
              model={model.sound}
              dispatch={(c) => dispatch({ t: "sound", c })}
            />
          </>
        ),
      }}
    />
  )
}

const ViewBottomNavBar = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: ClientCtx | AnonymousClientCtx
  model: ModelClient
  dispatch: (m: MsgClient) => void
}) => {
  if (isAnonymous(ctx)) {
    return null
  }
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
