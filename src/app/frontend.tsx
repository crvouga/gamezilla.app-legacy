import { Browser } from '~/@/browser'
import { DbConnSql } from '~/@/db-conn-sql/frontend/impl'
import { Eff } from '~/@/eff'
import { eq } from '~/@/equals/equals'
import { HttpClient } from '~/@/http-client'
import { HttpServerImpl } from '~/@/http-server/http-server-impl'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { Msg } from '~/@/msg/msg'
import { RPC } from '~/@/rpc'
import { Screen } from '~/@/screen/generated/screens'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { IconGamepad, IconUserCircle, Portal } from '~/@/ui'
import { IntersectionObserverEmitter } from '~/@/ui/intersection-observer'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { CONFIG_SHARED } from '~/config/shared'
import { ILogger, Logger } from '../@/logger'
import { setupNewPowerSyncDatabase } from '../service-powersync/frontend/database'
import { APP_SOUND, AppFrontendCmd, preloadSound } from './@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx, BaseFrontendCtx, isAppFrontendCtx } from './@/frontend/ctx'
import { FrontendEvt } from './@/frontend/evt'
import { Translator } from './@/frontend/translator'
import { LogoBlock } from './@/ui/logo/logo-block'
import { RootLayout } from './@/ui/screen-layout'
import { ScreenLayoutProps } from './@/ui/screen-layout/props'
import * as AuthFrontend from './auth/frontend'
import { CurrentScreen, Platform, Sound, StatusBar, Toast } from './frontend/index'
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
    throw new Error('BACKEND_URL is undefined')
  }

  const transport = await FrontendTransport<MsgToBackend, MsgToFrontend>(
    toFrontendTransportConfig({
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
    t: 'powersync',
    powersync: await setupNewPowerSyncDatabase(),
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
    documentVisibilityState: input.model.platform.documentVisibilityState,
    currentScreen: input.model.currentScreen.currentScreen,
    currentUserId: null,
    screenSize: input.model.platform.screenSize,
  }
  if (input.model.auth.currentUser.t === 'logged-in') {
    return {
      ...anonymousCtx,
      currentUser: input.model.auth.currentUser.account,
      currentUserRole: input.model.auth.currentUser.account.role,
      currentUserId: input.model.auth.currentUser.account.userId,
    }
  }
  return anonymousCtx
}

const toFrontendTransportConfig = (input: {
  httpServerImpl: HttpServerImpl
  backendUrl: string
  logger: ILogger
}): Parameters<typeof FrontendTransport>[0] => {
  switch (input.httpServerImpl) {
    case 'bun': {
      return {
        ...input,
        t: 'standard-web-sockets',
      }
    }
    case 'node': {
      return {
        ...input,
        t: 'noop',
      }
    }
  }
}

export const init = (input: { ctx: FrontendCtx }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  const screen = CurrentScreen.init({ location: input.ctx.location })
  const platform = Platform.init({ stored: input.ctx.stored })

  const ctx: AnonymousFrontendCtx = {
    ...input.ctx,
    currentScreen: screen.model.currentScreen,
    t: Translator(input.ctx.navigatorLanguage),
    currentUserId: null,
    documentVisibilityState: 'visible',
    profiles: {},
    screenSize: platform.model.screenSize,
  }

  const lang = LangFrontend.init({ ctx, stored: input.ctx.stored })
  const toast = Toast.init({ stored: input.ctx.stored, ctx })
  const wire = WireFrontend.init({ ctx: { ...ctx, rpc: input.ctx.rpc.wire }, stored: input.ctx.stored })
  const auth = AuthFrontend.init({ stored: input.ctx.stored, ctx })
  const space = SpacesFrontend.init({ ctx, stored: input.ctx.stored })
  const profile = ProfileFrontend.init({ ctx, stored: input.ctx.stored })
  const sound = Sound.init({ ctx, stored: input.ctx.stored })
  const statusBar = StatusBar.init({ stored: input.ctx.stored })

  const initialModel: ModelFrontend = {
    statusBar: statusBar.model,
    currentScreen: screen.model,
    toast: toast.model,
    wire: wire.model,
    sound: sound.model,
    platform: platform.model,
    spaces: space.model,
    auth: auth.model,
    profile: profile.model,
    lang: lang.model,
  }

  const initialEff = Eff.batch<MsgFrontend>([screen.eff, Eff.tag('auth', auth.eff), Eff.tag('lang', lang.eff)])

  const initialCmd = Msg.batch<AppFrontendCmd<{ MsgToBackend: MsgToBackend; MsgFrontend: MsgFrontend }>>(
    AppFrontendCmd.tag('spaces', space.msgCmd),
    AppFrontendCmd.tag('profile', profile.msgCmd),
    AppFrontendCmd.tag('auth', auth.msgCmd),
    AppFrontendCmd.tag('lang', lang.msgCmd),
    preloadSound(Object.values(APP_SOUND)),
  )

  const updated = updateLoop(input.ctx, { model: initialModel, eff: initialEff, msgCmd: initialCmd, msgEvt: [] })

  return updated
}

export const update = (input: {
  ctx: FrontendCtx
  msg: MsgFrontend
  model: ModelFrontend
}): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
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
  msgEvt: FrontendEvt[]
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
  msgEvt?: FrontendEvt
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

  const screen = CurrentScreen.update({
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

  const sound = Sound.update({
    model: input.model.sound,
    msg: input.msg?.t === 'sound' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'sound' ? input.msgCmd : null,
    ctx: frontendCtx,
  })

  const platform = Platform.update({
    model: input.model.platform,
    msg: input.msg?.t === 'platform' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'platform' ? input.msgCmd : null,
  })

  const statusBar = StatusBar.update({
    model: input.model.statusBar,
    msg: input.msg?.t === 'status-bar' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'status-bar' ? input.msgCmd : null,
  })

  const toast = Toast.update({
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

  return {
    model: {
      auth: auth.model,
      platform: platform.model,
      profile: profile.model,
      currentScreen: screen.model,
      sound: sound.model,
      spaces: space.model,
      statusBar: statusBar.model,
      toast: toast.model,
      wire: wire.model,
      lang: lang.model,
    },

    eff: Eff.batch<MsgFrontend>([
      Eff.tag('auth', auth.eff),
      Eff.tag('platform', platform.eff),
      Eff.tag('profile', profile.eff),
      Eff.tag('current-screen', screen.eff),
      Eff.tag('sound', sound.eff),
      Eff.tag('spaces', space.eff),
      Eff.tag('toast', toast.eff),
      Eff.tag('wire', wire.eff),
      Eff.tag('lang', lang.eff),
    ]),

    msgEvt: Msg.batch<FrontendEvt>(
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
    Sub.tag('platform', Platform.subscriptions),
    Sub.tag('current-screen', CurrentScreen.subscriptions),
    Sub.tag('wire', WireFrontend.subscriptions({ transport: input.ctx.transport })),
    Sub.tag('lang', LangFrontend.subscriptions({ ctx, model: input.model.lang })),
    Sub.tag('toast', Toast.subscriptions({ ctx, model: input.model.toast })),
    Sub.tag('auth', AuthFrontend.subscriptions({ ctx, model: input.model.auth })),
    Sub.tag('spaces', SpacesFrontend.subscriptions({ ctx, model: input.model.spaces })),
  ])
}

export const View = (input: { ctx: FrontendCtx; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  const frontendCtx = toFrontendCtx(input)

  return (
    <RootLayout>
      <ViewStatusBar model={input.model} dispatch={input.dispatch} ctx={input.ctx} />

      <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
        <ViewScreen model={input.model} dispatch={input.dispatch} ctx={frontendCtx} />
      </div>

      <AuthFrontend.ViewModals
        ctx={frontendCtx}
        dispatch={(c) => input.dispatch({ t: 'auth', c })}
        model={input.model.auth}
      />

      <Portal.Exit portalId='app-root' />

      <Toast.View ctx={frontendCtx} model={input.model.toast} dispatch={(c) => input.dispatch({ t: 'toast', c })} />
    </RootLayout>
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
          return <LogoBlock />

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

const ViewStatusBar: typeof View = (input) => {
  const frontendCtx = toFrontendCtx({ model: input.model, ctx: input.ctx })

  return (
    <StatusBar.View
      ctx={frontendCtx}
      model={input.model.statusBar}
      dispatch={(c) => input.dispatch({ t: 'status-bar', c })}
      slots={{
        barLeft: <WireFrontend.ViewStatusBar ctx={frontendCtx} model={input.model.wire} />,

        barRight: <Sound.ViewStatusBar model={input.model.sound} />,

        drawerContent: (
          <>
            <WireFrontend.ViewStatusBarDrawer
              model={input.model.wire}
              dispatch={(c) => input.dispatch({ t: 'wire', c })}
              ctx={frontendCtx}
            />

            <LangFrontend.ViewStatusBarDrawer
              ctx={frontendCtx}
              dispatch={(c) => input.dispatch({ t: 'lang', c })}
              model={input.model.lang}
            />

            <Sound.ViewStatusBarDrawer
              ctx={frontendCtx}
              model={input.model.sound}
              dispatch={(c) => input.dispatch({ t: 'sound', c })}
            />
          </>
        ),
      }}
    />
  )
}

const toScreenLayoutProps = (input: {
  ctx: AppFrontendCtx | BaseFrontendCtx
  model: ModelFrontend
  dispatch: (m: MsgFrontend) => void
}): ScreenLayoutProps['parent'] | null => {
  const { ctx } = input
  if (!isAppFrontendCtx(ctx)) return null

  const screenSpace: Screen = { n: 'spaces', t: 'space-list' }
  const screenProfile: Screen = { n: 'profile', t: 'profile', userId: ctx.currentUserId }
  const pushSpaceList = () => input.dispatch({ t: 'current-screen', c: { t: 'clicked-link', screen: screenSpace } })
  return {
    renderMiniPlayer: () => (
      <SpacesFrontend.ViewCurrentSpaceBar
        ctx={ctx}
        model={input.model.spaces}
        dispatch={(c) => input.dispatch({ t: 'spaces', c })}
      />
    ),
    actions: {
      // renderNavBar: () => <NavBarLogo onClick={pushSpaceList} />,
      buttons: [
        {
          label: ctx.t('spaces.spaces'),
          icon: (input) => <IconGamepad {...input} />,
          color: eq(input.model.currentScreen.currentScreen, screenSpace) ? 'selected' : 'inherit',
          onClick: pushSpaceList,
        },
        {
          label: ctx.t('profile.profile'),
          icon: (input) => <IconUserCircle {...input} />,
          color: eq(input.model.currentScreen.currentScreen, screenProfile) ? 'selected' : 'inherit',
          onClick() {
            input.dispatch({ t: 'current-screen', c: { t: 'clicked-link', screen: screenProfile } })
          },
        },
      ],
      onToggle: () => {},
      open: false,
    },
  }
}
