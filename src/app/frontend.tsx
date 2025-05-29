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
import { Topic } from '~/@/topic'
import { IconGamepad } from '~/@/ui/icon/icon-gamepad'
import { IconUserCircle } from '~/@/ui/icon/icon-user-circle'
import { IntersectionObserverEmitter } from '~/@/ui/intersection-observer'
import { DrawerPortalExit } from '~/@/ui/surface-drawer/drawer-portal-exit'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdStorage } from '~/@/wire/client-session-id-storage'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { CONFIG_SHARED } from '~/config/shared'
import { setupNewPowerSyncClient } from '~/service-powersync/frontend/database'
import { ILogger, Logger } from '../@/logger'
import { UserProfile } from './@/data/user-profile'
import { APP_SOUND, AppFrontendCmd } from './@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx, AppFrontendCtxBase, isAppFrontendCtx } from './@/frontend/ctx'
import { PreloadSoundsCmd } from './@/frontend/preload-sounds-cmd'
import { Translator } from './@/frontend/translator'
import { ViewAppRoot } from './@/ui/app-root/app-root'
import { SplashScreen } from './@/ui/logo/splash-screen'
import { ParentScreenProps } from './@/ui/screen/layout/screen-layout-props'
import { toCurrentUserState } from './auth/current-user/frontend'
import { AuthFrontend } from './auth/frontend'
import { ViewAppStatusBar } from './frontend/app-status-bar/app-status-bar'
import * as FrontendFrontend from './frontend/frontend'
import { ToastFrontend } from './frontend/toast'
import * as LangFrontend from './lang/frontend'
import { ProfileFrontend } from './profile/frontend'
import { SpacesFrontend } from './spaces/frontend'
import {
  FrontendCtx,
  ModelFrontend,
  MsgFrontend,
  MsgToBackend,
  MsgToFrontend,
  rpcContract as contract,
  topicContract,
} from './types'
import * as WireFrontend from './wire/frontend'
import { FrontendTransport } from './wire/transport/frontend'

const initCtx = async (): Promise<FrontendCtx> => {
  const logger = Logger({
    t: 'console',
  })

  if (typeof CONFIG_FRONTEND.VITE_BACKEND_URL !== 'string') {
    throw new Error('VITE_BACKEND_URL is undefined')
  }

  const clientSessionId = ClientSessionIdStorage().get()

  const transport = await FrontendTransport<MsgToBackend, MsgToFrontend>(
    toTransportConfig({
      clientSessionId,
      httpServerImpl: CONFIG_SHARED.HTTP_SERVER_IMPL,
      backendUrl: CONFIG_FRONTEND.VITE_BACKEND_URL,
      logger,
    }),
  )

  const httpClient = HttpClient({
    t: 'fetch',
  })

  const rpcClient = RPC.initClient({
    t: 'http',
    httpClient,
    contract,
    serverUrl: CONFIG_FRONTEND.VITE_BACKEND_URL,
    clientSessionId,
  })

  const topicClient = Topic.initClient({
    t: 'web-sockets',
    contract: topicContract,
    serverUrl: CONFIG_FRONTEND.VITE_BACKEND_URL,
    clientSessionId,
    logger,
    endpoint: '/topic',
  })

  const dbConnSql = await DbConnSql({
    t: 'powersync-client',
    powerSyncClient: await setupNewPowerSyncClient(),
    logger,
  })

  const navigatorLanguage = LanguageCodeISO_639_1.getLangFromNavigator() ?? 'en'

  const ctx: AppFrontendCtxBase = {
    location: Browser.location(),
    clientSessionId,
    dbConnSql,
    logger,
    now: Posix.now(),
    navigatorLanguage,
    currentScreen: { t: 'login', n: 'auth-login' },
    t: Translator(navigatorLanguage),
    documentVisibilityState: 'visible',
    profilesByUserId: {},
    screenSize: 'mobile',
    parentScreen: null,
    currentUser: null,
    currentUserId: null,
    currentUserRole: null,
    httpClient,
  }

  const auth = await AuthFrontend.initCtx({ ctx: { ...ctx, rpcClient } })
  const profile = ProfileFrontend.initCtx({ ctx })
  return {
    ...ctx,
    ...profile,
    ...auth,
    transport,
    rpcClient,
    topicClient,
  }
}

const updateCtx = (ctx: FrontendCtx): FrontendCtx => {
  ctx.now = Posix.now()
  return ctx
}

type Ctx = (AppFrontendCtx | AnonymousFrontendCtx) & FrontendCtx

const toCtx = (input: { model: ModelFrontend; ctx: FrontendCtx }): Ctx => {
  const profiles: UserProfile[] = Object.values(input.model.profile.profilesByUserId)

  const anonymousCtx: AnonymousFrontendCtx = {
    ...input.ctx,
    t: Translator(input.model.lang.lang),
    profilesByUserId: UserProfile.indexByUserId(profiles),
    now: input.ctx.now,
    documentVisibilityState: input.model.frontend.visibility.documentVisibilityState,
    currentScreen: input.model.frontend.currentScreen.currentScreen,
    screenSize: input.model.frontend.screenSize.screenSize,
    parentScreen: null,
  }
  const currentUser = toCurrentUserState({
    model: input.model.auth.currentUser,
    ctx: input.ctx,
  })
  switch (currentUser.t) {
    case 'logged-in':
      const appCtx: AppFrontendCtx = {
        ...anonymousCtx,
        currentUser: currentUser.userAccount,
        currentUserRole: currentUser.userAccount.role,
        currentUserId: currentUser.userAccount.userId,
      }
      return {
        ...input.ctx,
        ...appCtx,
      }
    default:
      return {
        ...input.ctx,
        ...anonymousCtx,
      }
  }
}

const toTransportConfig = (input: {
  clientSessionId: ClientSessionId
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

const init = (input: { ctx: FrontendCtx }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  const frontend = FrontendFrontend.init({
    ctx: input.ctx,
    location: input.ctx.location,
    stored: {},
  })

  const ctx: AnonymousFrontendCtx = {
    ...input.ctx,
    currentScreen: frontend.model.currentScreen.currentScreen,
    documentVisibilityState: frontend.model.visibility.documentVisibilityState,
    screenSize: frontend.model.screenSize.screenSize,
  }

  const lang = LangFrontend.init({ ctx })
  const wire = WireFrontend.init({ ctx: { ...ctx, rpc: input.ctx.rpcClient.wire }, stored: {} })
  const auth = AuthFrontend.init({ ctx: input.ctx })
  const space = SpacesFrontend.init({ ctx })
  const profile = ProfileFrontend.init({ ctx: input.ctx })

  const initialModel: ModelFrontend = {
    frontend: frontend.model,
    spaces: space.model,
    wire: wire.model,
    auth: auth.model,
    profile: profile.model,
    lang: lang.model,
  }

  const initialEff = Eff.batch<MsgFrontend>([
    Eff.tag('frontend', frontend.eff),
    Eff.tag('auth', auth.eff),
    Eff.tag('lang', lang.eff),
  ])

  const initialCmd = Msg.batch<AppFrontendCmd<MsgToBackend>>(
    //
    AppFrontendCmd.tag('spaces', space.msgCmd),
  )

  const initialMsgOut = Msg.batch(PreloadSoundsCmd.init(Object.values(APP_SOUND)))

  const updated = updateLoop(input.ctx, {
    model: initialModel,
    eff: initialEff,
    msgCmd: initialCmd,
    msgOut: initialMsgOut,
  })

  return updated
}

const update = (input: {
  ctx: FrontendCtx
  msg: MsgFrontend
  model: ModelFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  const msgBackend = input.msg.t === '→' ? input.msg.c : undefined
  const frontendCtx = toCtx(input)
  const updatedChild = updateChild({
    ctx: frontendCtx,
    model: input.model,
    msg: input.msg,
    msgBackend: msgBackend,
  })
  const updated = updateLoop(frontendCtx, updatedChild)

  return updated
}

type Output = {
  model: ModelFrontend
  eff: Eff<MsgFrontend>
  msgOut: unknown[]
  msgCmd: AppFrontendCmd<MsgToBackend>[]
}

const updateLoop = (ctx: FrontendCtx, acc: Output): Output => {
  const frontendCtx = toCtx({ ctx, model: acc.model })
  const [msgCmd, ...msgCmdRest] = acc.msgCmd

  if (msgCmd) {
    const updatedCmd = updateChild({ ctx: frontendCtx, model: acc.model, msgCmd })

    return updateLoop(frontendCtx, {
      model: updatedCmd.model,
      msgCmd: Msg.batch(msgCmdRest, updatedCmd.msgCmd),
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
      msgOut: Msg.batch(acc.msgOut, updatedCmd.msgOut),
    })
  }

  const [msgOut, ...msgOutRest] = acc.msgOut

  if (msgOut) {
    const updatedOut = updateChild({
      ctx: frontendCtx,
      model: acc.model,
      msgIn: msgOut,
    })

    return updateLoop(frontendCtx, {
      model: updatedOut.model,
      msgCmd: Msg.batch(msgCmdRest, updatedOut.msgCmd),
      eff: Eff.batch([acc.eff, updatedOut.eff]),
      msgOut: Msg.batch(msgOutRest, updatedOut.msgOut),
    })
  }

  return acc
}

const updateChild = (input: {
  ctx: FrontendCtx
  model: ModelFrontend
  msg?: MsgFrontend
  msgBackend?: MsgToFrontend
  msgIn?: unknown
  msgCmd?: AppFrontendCmd<MsgToBackend>
}): Output => {
  const frontendCtx = toCtx(input)

  const space = SpacesFrontend.update({
    ctx: frontendCtx,
    model: input.model.spaces,
    msg: input.msg?.t === 'spaces' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'spaces' ? input.msgBackend.c : null,
    msgIn: input.msgIn,
  })

  const profile = ProfileFrontend.update({
    ctx: frontendCtx,
    model: input.model.profile,
    msg: input.msg?.t === 'profile' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'profile' ? input.msgBackend.c : null,
    msgIn: input.msgIn,
  })

  const auth = AuthFrontend.update({
    ctx: frontendCtx,
    model: input.model.auth,
    msg: input.msg?.t === 'auth' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'auth' ? input.msgBackend.c : null,
    msgIn: input.msgIn,
  })

  const wire = WireFrontend.update({
    ctx: frontendCtx,
    model: input.model.wire,
    msg: input.msg?.t === 'wire' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'wire' ? input.msgBackend.c : null,
    msgCmd: input.msgCmd?.n === 'wire' ? input.msgCmd : null,
    transport: input.ctx.transport,
  })

  const lang = LangFrontend.update({
    ctx: frontendCtx,
    model: input.model.lang,
    msg: input.msg?.t === 'lang' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'lang' ? input.msgBackend.c : null,
    msgIn: input.msgIn,
  })

  const frontend = FrontendFrontend.update({
    ctx: frontendCtx,
    model: input.model.frontend,
    msg: input.msg?.t === 'frontend' ? input.msg.c : undefined,
    msgBackend: input.msgBackend?.t === 'frontend' ? input.msgBackend.c : undefined,
    msgIn: input.msgIn,
  })

  return {
    model: {
      frontend: frontend.model,
      auth: auth.model,
      profile: profile.model,
      spaces: space.model,
      wire: wire.model,
      lang: lang.model,
    },
    eff: Eff.batch<MsgFrontend>([
      Eff.tag('auth', auth.eff),
      Eff.tag('profile', profile.eff),
      Eff.tag('spaces', space.eff),
      Eff.tag('wire', wire.eff),
      Eff.tag('lang', lang.eff),
      Eff.tag('frontend', frontend.eff),
    ]),
    msgOut: Msg.batch(auth.msgOut, profile.msgOut, space.msgOut, lang.msgOut, frontend.msgOut),
    msgCmd: Msg.batch<AppFrontendCmd<MsgToBackend>>(AppFrontendCmd.tag('spaces', space.msgCmd)),
  }
}

const subscriptions = (input: { ctx: FrontendCtx; model: ModelFrontend }): Sub<MsgFrontend> => {
  const ctx = toCtx(input)

  return Sub.batch<MsgFrontend>([
    Sub.tag('→', Sub.flat(input.ctx.transport.fromBackend)),
    Sub.tag('frontend', FrontendFrontend.subscriptions({ ctx, model: input.model.frontend })),
    Sub.tag('wire', WireFrontend.subscriptions({ transport: input.ctx.transport })),
    Sub.tag('lang', LangFrontend.subscriptions({ ctx, model: input.model.lang })),
    Sub.tag('auth', AuthFrontend.subscriptions({ ctx, model: input.model.auth })),
    Sub.tag('spaces', SpacesFrontend.subscriptions({ ctx, model: input.model.spaces })),
    Sub.tag('profile', ProfileFrontend.subscriptions({ ctx, model: input.model.profile })),
  ])
}

const View = (input: { ctx: FrontendCtx; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  const frontendCtx = toCtx(input)

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
        model={input.model.frontend.toast}
        dispatch={(c) => input.dispatch({ t: 'frontend', c: { t: 'toast', c } })}
      />
    </ViewAppRoot>
  )
}

const ViewScreen = (input: { ctx: Ctx; model: ModelFrontend; dispatch: (m: MsgFrontend) => void }) => {
  switch (input.model.frontend.currentScreen.currentScreen.n) {
    case 'lang':
      return (
        <LangFrontend.View
          ctx={input.ctx}
          dispatch={(c) => input.dispatch({ t: 'lang', c })}
          model={input.model.lang}
        />
      )
    default: {
      const currentUser = toCurrentUserState({
        model: input.model.auth.currentUser,
        ctx: input.ctx,
      })
      switch (currentUser.t) {
        case 'loading':
          return <SplashScreen />
        case 'logged-out':
          return <ViewScreenLoggedOut model={input.model} dispatch={input.dispatch} ctx={input.ctx} />
        case 'logged-in':
          return <ViewScreenLoggedIn model={input.model} dispatch={input.dispatch} ctx={input.ctx} />
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
            input.dispatch({
              t: 'frontend',
              c: { t: 'current-screen', c: { t: 'clicked-link', screen: { t: 'login', n: 'auth-login' } } },
            })
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
            input.dispatch({
              t: 'frontend',
              c: { t: 'current-screen', c: { t: 'clicked-link', screen: { n: 'spaces', t: 'space-list' } } },
            })
          }
        />
      )
  }
}

const toScreenLayoutProps = (input: {
  ctx: AppFrontendCtx | AppFrontendCtxBase
  model: ModelFrontend
  dispatch: (m: MsgFrontend) => void
}): ParentScreenProps | null => {
  const { ctx } = input
  if (!isAppFrontendCtx(ctx)) return null

  const screenSpace: Screen = { n: 'spaces', t: 'space-list' }
  const screenProfile: Screen = { n: 'profile', t: 'profile', userId: ctx.currentUser.userId }
  const pushSpaceList = () =>
    input.dispatch({ t: 'frontend', c: { t: 'current-screen', c: { t: 'clicked-link', screen: screenSpace } } })
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
            color: input.model.frontend.currentScreen.currentScreen.n === 'spaces' ? 'selected' : 'inherit',
            onClick: pushSpaceList,
            id: ctx.t('spaces.spaces'),
          },
          {
            label: ctx.t('profile.profile'),
            icon: (input) => <IconUserCircle {...input} />,
            color: input.model.frontend.currentScreen.currentScreen.n === 'profile' ? 'selected' : 'inherit',
            onClick() {
              input.dispatch({
                t: 'frontend',
                c: { t: 'current-screen', c: { t: 'clicked-link', screen: screenProfile } },
              })
            },
            id: ctx.t('profile.profile'),
          },
        ],
      },
    },
  }
}

export const AppFrontend = {
  initCtx,
  updateCtx,
  init,
  update,
  subscriptions,
  View,
}
