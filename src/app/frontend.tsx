import { Browser } from '~/@/browser'
import { DbConnSql } from '~/@/db-conn-sql/frontend/impl'
import { Eff } from '~/@/eff'
import { HttpClient } from '~/@/http-client'
import { HttpServerImpl } from '~/@/http-server/http-server-impl'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { Msg } from '~/@/msg/msg'
import { RPC } from '~/@/rpc'
import { Screen } from '~/@/screen/generated/screens'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { IconGamepad, IconUserCircle } from '~/@/ui'
import { IntersectionObserverEmitter } from '~/@/ui/intersection-observer'
import { DrawerPortalExit } from '~/@/ui/surface-drawer/drawer-portal-exit'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { CONFIG_SHARED } from '~/config/shared'
import { setupNewPowerSyncClient } from '~/service-powersync/frontend/database'
import { ILogger, Logger } from '../@/logger'
import { APP_SOUND, AppFrontendCmd, preloadSound } from './@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx, BaseFrontendCtx, isAppFrontendCtx } from './@/frontend/ctx'
import { AppFrontendEvt } from './@/frontend/evt'
import { Translator } from './@/frontend/translator'
import { ViewAppRoot } from './@/ui/app-root/app-root'
import { SplashScreen } from './@/ui/logo/logo-block'
import { ParentScreenProps } from './@/ui/screen/layout/screen-layout-props'
import * as AuthFrontend from './auth/frontend'
import { ViewAppStatusBar } from './frontend/app-status-bar/app-status-bar'
import { CopyToClipboardFrontend } from './frontend/copy-to-clipboard'
import { CurrentScreenFrontend } from './frontend/current-screen'
import { FocusFrontend } from './frontend/focus'
import { ScreenSizeFrontend } from './frontend/screen-size'
import { SoundFrontend } from './frontend/sound'
import { StatusBarFrontend } from './frontend/status-bar/index'
import { TimeFrontend } from './frontend/time'
import { ToastFrontend } from './frontend/toast'
import { VisibilityFrontend } from './frontend/visibility'
import * as LangFrontend from './lang/frontend'
import * as ProfileFrontend from './profile/frontend'
import { SpacesFrontend } from './spaces/frontend'
import {
  rpcContract,
  type FrontendCtx,
  type ModelFrontend,
  type MsgFrontend,
  type MsgToBackend,
  type MsgToFrontend,
} from './types'
import * as WireFrontend from './wire/frontend'
import { FrontendTransport } from './wire/transport/frontend'

export const initCtx = async (): Promise<FrontendCtx> => {
  const logger = Logger({
    t: 'console',
  })

  if (typeof CONFIG_FRONTEND.VITE_BACKEND_URL !== 'string') {
    throw new Error('VITE_BACKEND_URL is undefined')
  }

  const transport = await FrontendTransport<MsgToBackend, MsgToFrontend>(
    toTransportConfig({
      httpServerImpl: CONFIG_SHARED.HTTP_SERVER_IMPL,
      backendUrl: CONFIG_FRONTEND.VITE_BACKEND_URL,
      logger,
    }),
  )

  const httpClient = HttpClient({
    t: 'fetch',
    fetch: fetch as Fetch,
  })

  const rpc = RPC.initClient(httpClient, rpcContract)

  // const dbConnSql = dbConnSqlNoop

  const dbConnSql = await DbConnSql({
    t: 'powersync-client',
    powerSyncClient: await setupNewPowerSyncClient(),
    logger,
  })

  return {
    dbConnSql,
    logger,
    rpc,
    stored: {},
    transport,
    now: Posix.now(),
    location: Browser.location(),
    navigatorLanguage: LanguageCodeISO_639_1.getLangFromNavigator() ?? 'en',
  }
}

export const updateCtx = (ctx: FrontendCtx): FrontendCtx => {
  ctx.now = Posix.now()
  return ctx
}

type Ctx = AppFrontendCtx | AnonymousFrontendCtx

const toFrontendCtx = (input: { model: ModelFrontend; ctx: FrontendCtx }): Ctx => {
  const anonymousCtx: AnonymousFrontendCtx = {
    ...input.ctx,
    t: Translator(input.model.lang.lang),
    profiles: input.model.profile.profiles,
    now: input.ctx.now,
    documentVisibilityState: input.model.visibility.documentVisibilityState,
    currentScreen: input.model.currentScreen.currentScreen,
    screenSize: input.model.screenSize.screenSize,
    parentScreen: null,
  }
  switch (input.model.auth.currentUser.t) {
    case 'logged-in':
      return {
        ...anonymousCtx,
        currentUser: input.model.auth.currentUser.account,
        currentUserRole: input.model.auth.currentUser.account.role,
        currentUserId: input.model.auth.currentUser.account.userId,
      }
    default:
      return anonymousCtx
  }
}

const toTransportConfig = (input: {
  httpServerImpl: HttpServerImpl
  backendUrl: string
  logger: ILogger
}): Parameters<typeof FrontendTransport>[0] => {
  switch (input.httpServerImpl) {
    case 'bun':
      return { ...input, t: 'standard-web-sockets' }
    case 'node':
      return { ...input, t: 'noop' }
  }
}

export const init = (input: { ctx: FrontendCtx }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  const screen = CurrentScreenFrontend.init({ location: input.ctx.location })
  const visibility = VisibilityFrontend.init({ stored: input.ctx.stored })
  const screenSize = ScreenSizeFrontend.init()

  const ctx: AnonymousFrontendCtx = {
    ...input.ctx,
    currentScreen: screen.model.currentScreen,
    t: Translator(input.ctx.navigatorLanguage),
    documentVisibilityState: visibility.model.documentVisibilityState,
    profiles: {},
    screenSize: screenSize.model.screenSize,
    parentScreen: null,
  }

  const lang = LangFrontend.init({ ctx, stored: input.ctx.stored })
  const toast = ToastFrontend.init({ stored: input.ctx.stored, ctx })
  const wire = WireFrontend.init({ ctx: { ...ctx, rpc: input.ctx.rpc.wire }, stored: input.ctx.stored })
  const auth = AuthFrontend.init({ stored: input.ctx.stored, ctx })
  const space = SpacesFrontend.init({ ctx, stored: input.ctx.stored })
  const profile = ProfileFrontend.init({ ctx: { ...ctx, parentScreen: null }, stored: input.ctx.stored })
  const sound = SoundFrontend.init({ ctx, stored: input.ctx.stored })
  const statusBar = StatusBarFrontend.init({ stored: input.ctx.stored })
  const focus = FocusFrontend.init()
  const copyToClipboard = CopyToClipboardFrontend.init()
  const time = TimeFrontend.init()

  const initialModel: ModelFrontend = {
    time: time.model,
    focus: focus.model,
    statusBar: statusBar.model,
    currentScreen: screen.model,
    toast: toast.model,
    wire: wire.model,
    sound: sound.model,
    visibility: visibility.model,
    spaces: space.model,
    auth: auth.model,
    profile: profile.model,
    lang: lang.model,
    screenSize: screenSize.model,
    copyToClipboard: copyToClipboard.model,
  }

  const initialEff = Eff.batch<MsgFrontend>([screen.eff, Eff.tag('auth', auth.eff), Eff.tag('lang', lang.eff)])

  const initialCmd = Msg.batch<AppFrontendCmd<{ MsgToBackend: MsgToBackend; MsgFrontend: MsgFrontend }>>(
    AppFrontendCmd.tag('spaces', space.msgCmd),
    AppFrontendCmd.tag('profile', profile.msgCmd),
    AppFrontendCmd.tag('auth', auth.msgCmd),
    AppFrontendCmd.tag('lang', lang.msgCmd),
    preloadSound(Object.values(APP_SOUND)),
  )

  const updated = updateLoop(input.ctx, {
    model: initialModel,
    eff: initialEff,
    msgCmd: initialCmd,
    msgEvt: [],
  })

  return updated
}

export const update = (input: {
  ctx: FrontendCtx
  msg: MsgFrontend
  model: ModelFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  const msgBackend = input.msg.t === '→' ? input.msg.c : undefined

  const updatedChild = updateChild({
    ctx: input.ctx,
    model: input.model,
    msg: input.msg,
    msgBackend: msgBackend,
  })

  const updated = updateLoop(input.ctx, updatedChild)

  return updated
}

type Output = {
  model: ModelFrontend
  eff: Eff<MsgFrontend>
  msgEvt: AppFrontendEvt[]
  msgCmd: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>[]
}

const updateLoop = (ctx: FrontendCtx, acc: Output): Output => {
  const [msgCmd, ...msgCmdRest] = acc.msgCmd

  if (msgCmd) {
    const updatedCmd = updateChild({ ctx, model: acc.model, msgCmd })
    return updateLoop(ctx, {
      model: updatedCmd.model,
      msgCmd: Msg.batch(msgCmdRest, updatedCmd.msgCmd),
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
      msgEvt: Msg.batch(acc.msgEvt, updatedCmd.msgEvt),
    })
  }

  const [msgEvt, ...msgEvtRest] = acc.msgEvt

  if (msgEvt) {
    const updatedEvt = updateChild({ ctx, model: acc.model, msgEvt })
    return updateLoop(ctx, {
      model: updatedEvt.model,
      msgCmd: Msg.batch(msgCmdRest, updatedEvt.msgCmd),
      eff: Eff.batch([acc.eff, updatedEvt.eff]),
      msgEvt: Msg.batch(msgEvtRest, updatedEvt.msgEvt),
    })
  }

  return acc
}

const updateChild = (input: {
  ctx: FrontendCtx
  model: ModelFrontend
  msg?: MsgFrontend
  msgBackend?: MsgToFrontend
  msgEvt?: AppFrontendEvt
  msgCmd?: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>
}): Output => {
  const frontendCtx = toFrontendCtx(input)

  const space = SpacesFrontend.update({
    ctx: frontendCtx,
    model: input.model.spaces,
    msg: input.msg?.t === 'spaces' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'spaces' ? input.msgBackend.c : null,
    msgEvt: input.msgEvt,
    msgCmd: null,
  })

  const profile = ProfileFrontend.update({
    ctx: frontendCtx,
    model: input.model.profile,
    msg: input.msg?.t === 'profile' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'profile' ? input.msgBackend.c : null,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd?.t === 'profile' ? input.msgCmd : null,
  })

  const auth = AuthFrontend.update({
    ctx: frontendCtx,
    model: input.model.auth,
    msg: input.msg?.t === 'auth' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'auth' ? input.msgBackend.c : null,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd?.t === 'auth' ? input.msgCmd : null,
  })

  const screen = CurrentScreenFrontend.update({
    model: input.model.currentScreen,
    msg: input.msg?.t === 'current-screen' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'current-screen' ? input.msgCmd : null,
  })

  const wire = WireFrontend.update({
    ctx: frontendCtx,
    model: input.model.wire,
    msg: input.msg?.t === 'wire' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'wire' ? input.msgBackend.c : null,
    msgCmd: input.msgCmd?.t === 'wire' ? input.msgCmd : null,
    transport: input.ctx.transport,
  })

  const sound = SoundFrontend.update({
    model: input.model.sound,
    msg: input.msg?.t === 'sound' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'sound' ? input.msgCmd : null,
    ctx: frontendCtx,
  })

  const visibility = VisibilityFrontend.update({
    model: input.model.visibility,
    msg: input.msg?.t === 'visibility' ? input.msg.c : null,
  })

  const statusBar = StatusBarFrontend.update({
    model: input.model.statusBar,
    msg: input.msg?.t === 'status-bar' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'status-bar' ? input.msgCmd : null,
  })

  const toast = ToastFrontend.update({
    model: input.model.toast,
    msg: input.msg?.t === 'toast' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'toast' ? input.msgCmd : null,
    ctx: frontendCtx,
  })

  const lang = LangFrontend.update({
    model: input.model.lang,
    msg: input.msg?.t === 'lang' ? input.msg.c : null,
    msgCmd: null,
    msgBackend: input.msgBackend?.t === 'lang' ? input.msgBackend.c : null,
    msgEvt: input.msgEvt,
    ctx: frontendCtx,
  })

  const screenSize = ScreenSizeFrontend.update({
    model: input.model.screenSize,
    msg: input.msg?.t === 'screen-size' ? input.msg.c : null,
  })

  const copyToClipboard = CopyToClipboardFrontend.update({
    model: input.model.copyToClipboard,
    msg: input.msg?.t === 'copy-to-clipboard' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'copy-to-clipboard' ? input.msgCmd : null,
  })

  const focus = FocusFrontend.update({
    model: input.model.focus,
    msg: input.msg?.t === 'focus' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'focus' ? input.msgCmd : null,
  })

  const time = TimeFrontend.update({
    model: input.model.time,
    msg: input.msg?.t === 'time' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'time' ? input.msgCmd : null,
  })

  return {
    model: {
      time: time.model,
      focus: focus.model,
      auth: auth.model,
      visibility: visibility.model,
      profile: profile.model,
      currentScreen: screen.model,
      sound: sound.model,
      spaces: space.model,
      statusBar: statusBar.model,
      toast: toast.model,
      wire: wire.model,
      lang: lang.model,
      screenSize: screenSize.model,
      copyToClipboard: copyToClipboard.model,
    },
    eff: Eff.batch<MsgFrontend>([
      Eff.tag('auth', auth.eff),
      Eff.tag('visibility', visibility.eff),
      Eff.tag('profile', profile.eff),
      Eff.tag('current-screen', screen.eff),
      Eff.tag('sound', sound.eff),
      Eff.tag('spaces', space.eff),
      Eff.tag('toast', toast.eff),
      Eff.tag('wire', wire.eff),
      Eff.tag('lang', lang.eff),
      Eff.tag('copy-to-clipboard', copyToClipboard.eff),
      Eff.tag('focus', focus.eff),
      Eff.tag('time', time.eff),
      time.parentEff,
    ]),
    msgEvt: Msg.batch<AppFrontendEvt>(
      auth.msgEvt,
      profile.msgEvt,
      screen.msgEvt,
      sound.msgEvt,
      space.msgEvt,
      toast.msgEvt,
      wire.msgEvt,
      lang.msgEvt,
    ),
    msgCmd: Msg.batch<AppFrontendCmd<{ MsgToBackend: MsgToBackend; MsgFrontend: MsgFrontend }>>(
      AppFrontendCmd.tag('auth', auth.msgCmd),
      AppFrontendCmd.tag('profile', profile.msgCmd),
      AppFrontendCmd.tag('spaces', space.msgCmd),
      AppFrontendCmd.tag('lang', lang.msgCmd),
      statusBar.msgCmd,
      screen.msgCmd,
      sound.msgCmd,
      toast.msgCmd,
    ),
  }
}

export const subscriptions = (input: { ctx: FrontendCtx; model: ModelFrontend }): Sub<MsgFrontend> => {
  const ctx = toFrontendCtx(input)

  return Sub.batch<MsgFrontend>([
    Sub.tag('→', Sub.flat(input.ctx.transport.fromBackend)),
    Sub.tag('visibility', VisibilityFrontend.subscriptions),
    Sub.tag('focus', FocusFrontend.subscriptions),
    Sub.tag('copy-to-clipboard', CopyToClipboardFrontend.subscriptions),
    Sub.tag('time', TimeFrontend.subscriptions),
    Sub.tag('screen-size', ScreenSizeFrontend.subscriptions),
    Sub.tag('current-screen', CurrentScreenFrontend.subscriptions),
    Sub.tag('wire', WireFrontend.subscriptions({ transport: input.ctx.transport })),
    Sub.tag('lang', LangFrontend.subscriptions({ ctx, model: input.model.lang })),
    Sub.tag('toast', ToastFrontend.subscriptions({ ctx, model: input.model.toast })),
    Sub.tag('auth', AuthFrontend.subscriptions({ ctx, model: input.model.auth })),
    Sub.tag('spaces', SpacesFrontend.subscriptions({ ctx, model: input.model.spaces })),
  ])
}

export const View = (input: { ctx: FrontendCtx; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  const frontendCtx = toFrontendCtx(input)

  return (
    <ViewAppRoot>
      <ViewAppStatusBar model={input.model} dispatch={input.dispatch} ctx={frontendCtx} />

      <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
        <ViewScreen model={input.model} dispatch={input.dispatch} ctx={frontendCtx} />
      </div>

      <AuthFrontend.ViewModals
        ctx={frontendCtx}
        dispatch={(c) => input.dispatch({ t: 'auth', c })}
        model={input.model.auth}
      />

      <DrawerPortalExit />

      <ToastFrontend.View
        ctx={frontendCtx}
        model={input.model.toast}
        dispatch={(c) => input.dispatch({ t: 'toast', c })}
      />
    </ViewAppRoot>
  )
}

const ViewScreen = (input: {
  ctx: AppFrontendCtx | AnonymousFrontendCtx
  model: ModelFrontend
  dispatch: (m: MsgFrontend) => void
}) => {
  switch (input.model.currentScreen.currentScreen.n) {
    case 'lang':
      return (
        <LangFrontend.View
          ctx={input.ctx}
          dispatch={(c) => input.dispatch({ t: 'lang', c })}
          model={input.model.lang}
        />
      )
    default: {
      switch (input.model.auth.currentUser.t) {
        case 'loading':
          return <SplashScreen />

        case 'logged-in':
          return <ViewScreenLoggedIn model={input.model} dispatch={input.dispatch} ctx={input.ctx} />

        case 'logged-out':
          return <ViewScreenLoggedOut model={input.model} dispatch={input.dispatch} ctx={input.ctx} />
      }
    }
  }
}

const ViewScreenLoggedOut: typeof ViewScreen = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'auth-login':
      return (
        <AuthFrontend.View
          model={input.model.auth}
          ctx={input.ctx}
          dispatch={(c) => input.dispatch({ t: 'auth', c })}
        />
      )
    case 'spaces':
    case 'profile':
    case 'lang':
      return (
        <IntersectionObserverEmitter
          id='app-intersection-observer'
          onVisible={() =>
            input.dispatch({ t: 'current-screen', c: { t: 'clicked-link', screen: { t: 'login', n: 'auth-login' } } })
          }
        />
      )
  }
}

const ViewScreenLoggedIn: typeof ViewScreen = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'profile':
      return (
        <ProfileFrontend.View
          dispatch={(m) => input.dispatch({ t: 'profile', c: m })}
          model={input.model.profile}
          ctx={{ ...input.ctx, parentScreen: toScreenLayoutProps(input) }}
        />
      )

    case 'spaces':
      return (
        <SpacesFrontend.View
          dispatch={(m) => input.dispatch({ t: 'spaces', c: m })}
          model={input.model.spaces}
          ctx={{ ...input.ctx, parentScreen: toScreenLayoutProps(input) }}
        />
      )

    case 'lang':
    case 'auth-login':
      return (
        <IntersectionObserverEmitter
          id='app-intersection-observer'
          onVisible={() =>
            input.dispatch({ t: 'current-screen', c: { t: 'clicked-link', screen: { n: 'spaces', t: 'space-list' } } })
          }
        />
      )
  }
}

const toScreenLayoutProps = (input: {
  ctx: AppFrontendCtx | BaseFrontendCtx
  model: ModelFrontend
  dispatch: (m: MsgFrontend) => void
}): ParentScreenProps | null => {
  const { ctx } = input
  if (!isAppFrontendCtx(ctx)) return null

  const screenSpace: Screen = { n: 'spaces', t: 'space-list' }
  const screenProfile: Screen = { n: 'profile', t: 'profile', userId: ctx.currentUser.userId }
  const pushSpaceList = () => input.dispatch({ t: 'current-screen', c: { t: 'clicked-link', screen: screenSpace } })
  return {
    id: 'app-screen-layout',
    parentScreen: null,
    renderMiniPlayer: (props) => {
      if (!isAppFrontendCtx(input.ctx)) return null
      return (
        <SpacesFrontend.ViewCurrentSpaceMiniPlayer
          key={props.key}
          ctx={input.ctx}
          model={input.model.spaces}
          dispatch={(c) => input.dispatch({ t: 'spaces', c })}
        />
      )
    },
    actionBar: {
      variant: {
        t: 'uniform',
        actions: [
          {
            label: ctx.t('spaces.spaces'),
            icon: (input) => <IconGamepad {...input} />,
            color: input.model.currentScreen.currentScreen.n === 'spaces' ? 'selected' : 'inherit',
            onClick: pushSpaceList,
            key: ctx.t('spaces.spaces'),
          },
          {
            label: ctx.t('profile.profile'),
            icon: (input) => <IconUserCircle {...input} />,
            color: input.model.currentScreen.currentScreen.n === 'profile' ? 'selected' : 'inherit',
            onClick() {
              input.dispatch({ t: 'current-screen', c: { t: 'clicked-link', screen: screenProfile } })
            },
            key: ctx.t('profile.profile'),
          },
        ],
      },
    },
  }
}
