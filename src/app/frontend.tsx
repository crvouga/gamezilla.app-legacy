import { Browser } from '~/@/browser'
import { DbConnSql } from '~/@/db-conn-sql/frontend/impl'
import { Eff } from '~/@/eff'
import { HttpClient } from '~/@/http-client'
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
import { ClientSessionIdStorage } from '~/@/wire/client-session-id-storage'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { setupNewPowerSyncClient } from '~/service-powersync/frontend/database'
import { Logger } from '../@/logger'
import { UserProfile } from './@/data/user-profile'
import { APP_SOUND } from './@/frontend/app-sound'
import { AnonymousFrontendCtx, AppFrontendCtx, AppFrontendCtxBase, isAppFrontendCtx } from './@/frontend/ctx'
import { PreloadSoundsCmd } from './@/frontend/preload-sounds-cmd'
import { Translator } from './@/frontend/translator'
import { ViewAppRoot } from './@/ui/app-root/app-root'
import { SplashScreen } from './@/ui/logo/splash-screen'
import { ParentScreenProps } from './@/ui/screen/layout/screen-layout-props'
import { toCurrentUserState } from './auth/current-user/frontend'
import { AuthFrontend } from './auth/frontend'
import { ViewAppStatusBar } from './frontend/app-status-bar/app-status-bar'
import { FrontendFrontend } from './frontend/frontend'
import { ToastFrontend } from './frontend/toast'
import { LangFrontend } from './lang/frontend'
import { ProfileFrontend } from './profile/frontend'
import { SpacesFrontend } from './spaces/frontend'
import { FrontendCtxModule, ModelFrontend, MsgFrontend, rpcContract as contract, topicContract } from './types'
import { WireFrontend } from './wire/frontend'

const initCtx = async (): Promise<FrontendCtxModule> => {
  const logger = Logger({
    t: 'console',
  })

  if (typeof CONFIG_FRONTEND.VITE_BACKEND_URL !== 'string') {
    throw new Error('VITE_BACKEND_URL is undefined')
  }

  const clientSessionId = ClientSessionIdStorage().get()

  const httpClient = HttpClient({
    t: 'fetch',
  })

  const rpc = RPC.initClient({
    t: 'http',
    httpClient,
    contract,
    serverUrl: CONFIG_FRONTEND.VITE_BACKEND_URL,
    clientSessionId,
  })

  const topic = Topic.initClient({
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

  const auth = await AuthFrontend.initCtx({ ctx: { ...ctx, rpc } })
  const profile = ProfileFrontend.initCtx({ ctx })
  return {
    ...ctx,
    ...profile,
    ...auth,
    rpc,
    topic,
  }
}

const updateCtx = (ctx: FrontendCtxModule): FrontendCtxModule => {
  ctx.now = Posix.now()
  return ctx
}

type Ctx = (AppFrontendCtx | AnonymousFrontendCtx) & FrontendCtxModule

const toCtx = (input: { model: ModelFrontend; ctx: FrontendCtxModule }): Ctx => {
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

const init = (input: { ctx: FrontendCtxModule }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  const frontend = FrontendFrontend.init({
    ctx: input.ctx,
    location: input.ctx.location,
  })

  const ctx: AnonymousFrontendCtx = {
    ...input.ctx,
    currentScreen: frontend.model.currentScreen.currentScreen,
    documentVisibilityState: frontend.model.visibility.documentVisibilityState,
    screenSize: frontend.model.screenSize.screenSize,
  }

  const lang = LangFrontend.init({ ctx })
  const wire = WireFrontend.init({ ctx: { ...ctx, rpc: input.ctx.rpc.wire, topic: input.ctx.topic.wire } })
  const auth = AuthFrontend.init({ ctx: input.ctx })
  const space = SpacesFrontend.init({ ctx: { ...ctx, rpc: input.ctx.rpc.spaces, topic: input.ctx.topic.spaces } })
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

  const initialMsgOut = Msg.batch(PreloadSoundsCmd.init(Object.values(APP_SOUND)))

  const updated = updateLoop(
    input.ctx,
    {
      model: initialModel,
      eff: initialEff,
      msgOut: initialMsgOut,
    },
    0,
  )

  return updated
}

const update = (input: {
  ctx: FrontendCtxModule
  msg: MsgFrontend
  model: ModelFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  const frontendCtx = toCtx(input)
  const updatedChild = updateChild({ ctx: frontendCtx, model: input.model, msg: input.msg })
  const updated = updateLoop(frontendCtx, updatedChild, 0)

  return updated
}

type Output = {
  model: ModelFrontend
  eff: Eff<MsgFrontend>
  msgOut: unknown[]
}

const updateLoop = (ctx: FrontendCtxModule, acc: Output, depth: number): Output => {
  const frontendCtx = toCtx({ ctx, model: acc.model })

  const [msgOut, ...msgOutRest] = acc.msgOut

  if (depth > 10) {
    throw new Error('updateLoop depth > 10')
  }

  if (msgOut) {
    const updatedOut = updateChild({ ctx: frontendCtx, model: acc.model, msgIn: msgOut })

    return updateLoop(
      frontendCtx,
      {
        model: updatedOut.model,
        eff: Eff.batch([acc.eff, updatedOut.eff]),
        msgOut: Msg.batch(msgOutRest, updatedOut.msgOut),
      },
      depth + 1,
    )
  }

  return acc
}

const updateChild = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg?: MsgFrontend
  msgIn?: unknown
}): Output => {
  const frontendCtx = toCtx(input)

  const space = SpacesFrontend.update({
    ctx: { ...frontendCtx, topic: frontendCtx.topic.spaces, rpc: frontendCtx.rpc.spaces },
    model: input.model.spaces,
    msg: input.msg?.t === 'spaces' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const profile = ProfileFrontend.update({
    ctx: frontendCtx,
    model: input.model.profile,
    msg: input.msg?.t === 'profile' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const auth = AuthFrontend.update({
    ctx: frontendCtx,
    model: input.model.auth,
    msg: input.msg?.t === 'auth' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const wire = WireFrontend.update({
    ctx: { ...frontendCtx, topic: frontendCtx.topic.wire, rpc: frontendCtx.rpc.wire },
    model: input.model.wire,
    msg: input.msg?.t === 'wire' ? input.msg.c : null,
  })

  const lang = LangFrontend.update({
    ctx: frontendCtx,
    model: input.model.lang,
    msg: input.msg?.t === 'lang' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const frontend = FrontendFrontend.update({
    ctx: frontendCtx,
    model: input.model.frontend,
    msg: input.msg?.t === 'frontend' ? input.msg.c : undefined,
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
    msgOut: Msg.batch(auth.msgOut, profile.msgOut, space.msgOut, lang.msgOut, frontend.msgOut),
    eff: Eff.batch<MsgFrontend>([
      Eff.tag('auth', auth.eff),
      Eff.tag('profile', profile.eff),
      Eff.tag('spaces', space.eff),
      Eff.tag('wire', wire.eff),
      Eff.tag('lang', lang.eff),
      Eff.tag('frontend', frontend.eff),
    ]),
  }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  const ctx = toCtx(input)

  return Sub.batch<MsgFrontend>([
    Sub.map(
      FrontendFrontend.subscriptions({ ctx, model: input.model.frontend }),
      (c): MsgFrontend => ({ t: 'frontend', c }),
    ),
    Sub.map(
      WireFrontend.subscriptions({
        ctx: { ...ctx, topic: ctx.topic.wire, rpc: ctx.rpc.wire },
        model: input.model.wire,
      }),
      (c): MsgFrontend => ({ t: 'wire', c }),
    ),
    Sub.map(LangFrontend.subscriptions({ ctx, model: input.model.lang }), (c): MsgFrontend => ({ t: 'lang', c })),
    Sub.map(AuthFrontend.subscriptions({ ctx, model: input.model.auth }), (c): MsgFrontend => ({ t: 'auth', c })),
    Sub.map(
      ProfileFrontend.subscriptions({ ctx, model: input.model.profile }),
      (c): MsgFrontend => ({ t: 'profile', c }),
    ),
    Sub.map(
      SpacesFrontend.subscriptions({
        ctx: { ...ctx, topic: input.ctx.topic.spaces, rpc: input.ctx.rpc.spaces },
        model: input.model.spaces,
      }),
      (c): MsgFrontend => ({ t: 'spaces', c }),
    ),
  ])
}

const View = (input: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
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
          ctx={{
            ...input.ctx,
            parentScreen: toScreenLayoutProps(input),
            topic: input.ctx.topic.spaces,
            rpc: input.ctx.rpc.spaces,
          }}
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
