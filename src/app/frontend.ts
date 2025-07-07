import { AudioPlayer } from '~/@/audio-player'
import { Eff } from '~/@/eff'
import { HttpClient } from '~/@/http-client'
import { KeyValueDb } from '~/@/key-value-db'
import { KeyBoard } from '~/@/keyboard'
import { LanguageCodeISO_639_1, TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Msg } from '~/@/msg/msg'
import { Navigation } from '~/@/navigation'
import { isErr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Screen } from '~/@/screens/generated/screens'
import { SqlDb } from '~/@/sql-db/frontend/impl'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Topic } from '~/@/topic'
import { IconGamepad, IconUserCircle } from '~/@/ui/icon'
import { IntersectionObserverEmitter } from '~/@/ui/intersection-observer'
import { DrawerPortalExit } from '~/@/ui/surface-drawer/drawer-portal-exit'
import { h } from '~/@/vdom/h'
import { Viewport } from '~/@/viewport'
import { ClientSessionIdStorage } from '~/@/wire/client-session-id-storage'
import { CONFIG_SHARED } from '~/config/shared'
import { BackendConnector } from '~/service-powersync/client/backend-connector'
import { PowerSyncClient } from '~/service-powersync/client/powersync-client'
import { Logger } from '../@/logger'
import { APP_SOUND } from './@/frontend/app-sound'
import { AppFrontendCtx, AppFrontendCtxBase, isAppFrontendCtx } from './@/frontend/ctx'
import { PreloadSoundsCmd } from './@/frontend/preload-sounds-cmd.$msg'
import { topicMsgCodec } from './@/topic-msg-codec'
import { ViewAppRoot } from './@/ui/app-root/app-root'
import { SplashScreen } from './@/ui/logo/splash-screen'
import { ParentScreenProps } from './@/ui/screen/layout/screen-layout-props'
import { toCurrentUserState } from './auth/current-user/frontend'
import { AuthFrontend } from './auth/frontend'
import { FrontendFrontend } from './frontend/frontend'
import { ToasterFrontend } from './frontend/toaster'
import { ProfileFrontend } from './profile/frontend'
import { SettingsFrontend } from './settings/frontend'
import { SpacesFrontend } from './spaces/frontend'
import { FrontendCtxModule, ModelFrontend, MsgFrontend, rpcContract as contract, topicContract } from './types'
import { BackendConnectionFrontend } from './wire/backend-connection/frontend'
import { WireFrontend } from './wire/frontend'

const initCtx = async (): Promise<FrontendCtxModule> => {
  const logger = Logger({
    t: 'console',
    namespace: ['frontend'],
    newLinePerMsg: true,
    maxLogLevel: 'info',
  })

  const clientSessionId = ClientSessionIdStorage().get()

  const httpClient = HttpClient({
    t: 'fetch',
  })

  const rpc = RPC.initClient({
    t: 'http',
    contract,
    serverUrl: CONFIG_SHARED.BACKEND_URL,
    clientSessionId,
    httpClient,
  })

  const topic = Topic.initClient({
    t: 'web-sockets',
    contract: topicContract,
    serverUrl: CONFIG_SHARED.BACKEND_URL,
    clientSessionId,
    logger,
    endpoint: '/topic',
    reconnectionRate: TimeSpan.seconds(3),
    syncSubscriptionRate: TimeSpan.seconds(3),
    codec: topicMsgCodec,
  })

  logger.info('Initializing PowerSync client...')

  const powersyncBackendConnector = new BackendConnector({
    logger,
    backendUrl: CONFIG_SHARED.BACKEND_URL,
    powersyncUrl: CONFIG_SHARED.POWERSYNC_URL,
    getGuestUserId: async () => null,
    clientSessionId,
  })

  const powerSyncClient = await PowerSyncClient({
    t: 'browser',
    debug: true,
    logger,
    backendConnector: powersyncBackendConnector,
  })

  logger.info('Starting PowerSync client...')
  powerSyncClient.start().then(() => {
    logger.info('PowerSync client started')
  })

  const sqlDb = await SqlDb({
    t: 'powersync-client',
    powerSyncClient,
    logger,
  })

  const navigatorLanguage = LanguageCodeISO_639_1.getLangFromNavigator() ?? 'en'

  const audioPlayer = AudioPlayer({
    t: 'web-standard',
    logger,
  })

  const navigation = Navigation({
    t: 'web-standard',
    logger,
  })

  const viewport = Viewport({ t: 'web-standard' })

  const keyboard = KeyBoard({ t: 'web-standard' })

  const keyValueDb = await KeyValueDb({ t: 'web-standard-storage', storage: localStorage, logger })

  const ctx: AppFrontendCtxBase = {
    audioPlayer,
    keyboard,
    viewport,
    navigation,
    clientSessionId,
    sqlDb,
    logger,
    now: UnixMs.now(),
    navigatorLanguage,
    currentScreen: { t: 'login', n: 'auth' },
    t: Translator(navigatorLanguage),
    viewportVisibility: 'visible',
    profilesByUserId: {},
    screenSize: 'mobile',
    parentScreen: null,
    currentUser: null,
    currentUserState: {
      t: 'loading',
    },
    httpClient,
    backendConnectionStatus: { t: 'connecting' },
    keyValueDb,
  }

  const auth = await AuthFrontend.initCtx({ ctx, rpc })
  const profile = ProfileFrontend.initCtx({ ctx })
  const spaces = await SpacesFrontend.initCtx({ ctx, rpc, topic })
  const wire = WireFrontend.initCtx({ ctx, rpc, topic })

  const ctxModule: FrontendCtxModule = {
    ...ctx,
    ...auth,
    ...profile,
    ...spaces,
    ...wire,
    rpc,
    topic,
  }

  powersyncBackendConnector.getGuestUserId = async () => {
    const userSession = await ctxModule.userSessionDb.query({
      whereAnd: { clientSessionId: { equals: ctxModule.clientSessionId } },
      order: { createdAt: 'desc' },
      pagination: { limit: 1, offset: 0 },
    })
    if (isErr(userSession)) return null
    return userSession.value.items[0]?.userId ?? null
  }

  return ctxModule
}

const toCtx = (input: { model: ModelFrontend; ctx: FrontendCtxModule }): FrontendCtxModule => {
  const currentUserState = toCurrentUserState({ model: input.model.auth.currentUser, ctx: input.ctx })

  const baseCtx: FrontendCtxModule = {
    ...input.ctx,
    now: UnixMs.now(),
    t: Translator(input.model.settings.lang),
    profilesByUserId: input.model.profile.profilesByUserId,
    viewportVisibility: input.model.frontend.visibility.visibility,
    currentScreen: input.model.frontend.currentScreen.currentScreen,
    screenSize: input.model.frontend.screenSize.screenSize,
    parentScreen: null,
    currentUserState,
    currentUser: currentUserState.t === 'logged-in' ? currentUserState.userAccount : null,
    backendConnectionStatus: BackendConnectionFrontend.toBackendConnectionStatus(input.model.wire.backendConnection),
  }

  return baseCtx
}

const init = (input: { ctx: FrontendCtxModule }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  const frontend = FrontendFrontend.init(input)

  const ctx: FrontendCtxModule = {
    ...input.ctx,
    currentScreen: frontend.model.currentScreen.currentScreen,
    viewportVisibility: frontend.model.visibility.visibility,
    screenSize: frontend.model.screenSize.screenSize,
  }

  const settings = SettingsFrontend.init({ ctx })
  const wire = WireFrontend.init({ ctx })
  const auth = AuthFrontend.init({ ctx })
  const space = SpacesFrontend.init({ ctx })
  const profile = ProfileFrontend.init({ ctx })

  const model: ModelFrontend = {
    frontend: frontend.model,
    spaces: space.model,
    wire: wire.model,
    auth: auth.model,
    profile: profile.model,
    settings: settings.model,
  }

  const eff = Eff.batch<MsgFrontend>([
    Eff.tag('frontend', frontend.eff),
    Eff.tag('auth', auth.eff),
    Eff.tag('settings', settings.eff),
    Eff.tag('profile', profile.eff),
    Eff.tag('spaces', space.eff),
    Eff.tag('wire', wire.eff),
  ])

  const msgOut = Msg.batch(PreloadSoundsCmd.init(Object.values(APP_SOUND)))

  const updated = updateLoop(input.ctx, { model, eff, msgOut })

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
  const updatedChild = updateChild(input)
  const updated = updateLoop(input.ctx, updatedChild)

  return updated
}

const updateLoop = (ctx: FrontendCtxModule, acc: ReturnType<typeof updateChild>): ReturnType<typeof updateChild> => {
  const [msgOut, ...msgOutRest] = acc.msgOut

  if (msgOut) {
    const updatedOut = updateChild({ ctx, model: acc.model, msgIn: msgOut })

    return updateLoop(ctx, {
      model: updatedOut.model,
      eff: Eff.batch([acc.eff, updatedOut.eff]),
      msgOut: Msg.batch(msgOutRest, updatedOut.msgOut),
    })
  }

  return acc
}

const updateChild = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg?: MsgFrontend
  msgIn?: unknown
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgOut: unknown[]
} => {
  const ctx = toCtx(input)

  const space = SpacesFrontend.update({
    ctx,
    model: input.model.spaces,
    msg: input.msg?.t === 'spaces' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const profile = ProfileFrontend.update({
    ctx,
    model: input.model.profile,
    msg: input.msg?.t === 'profile' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const auth = AuthFrontend.update({
    ctx,
    model: input.model.auth,
    msg: input.msg?.t === 'auth' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const wire = WireFrontend.update({
    ctx,
    model: input.model.wire,
    msg: input.msg?.t === 'wire' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const settings = SettingsFrontend.update({
    ctx,
    model: input.model.settings,
    msg: input.msg?.t === 'settings' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const frontend = FrontendFrontend.update({
    ctx,
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
      settings: settings.model,
    },
    msgOut: Msg.batch(auth.msgOut, profile.msgOut, space.msgOut, settings.msgOut, frontend.msgOut),
    eff: Eff.batch<MsgFrontend>([
      Eff.tag('auth', auth.eff),
      Eff.tag('profile', profile.eff),
      Eff.tag('spaces', space.eff),
      Eff.tag('wire', wire.eff),
      Eff.tag('settings', settings.eff),
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
    Sub.map(WireFrontend.subscriptions({ ctx, model: input.model.wire }), (c): MsgFrontend => ({ t: 'wire', c })),
    Sub.map(
      SettingsFrontend.subscriptions({ ctx, model: input.model.settings }),
      (c): MsgFrontend => ({ t: 'settings', c }),
    ),
    Sub.map(AuthFrontend.subscriptions({ ctx, model: input.model.auth }), (c): MsgFrontend => ({ t: 'auth', c })),
    Sub.map(
      ProfileFrontend.subscriptions({ ctx, model: input.model.profile }),
      (c): MsgFrontend => ({ t: 'profile', c }),
    ),
    Sub.map(SpacesFrontend.subscriptions({ ctx, model: input.model.spaces }), (c): MsgFrontend => ({ t: 'spaces', c })),
  ])
}

const View = (input: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  const frontendCtx = toCtx(input)

  return h(ViewAppRoot, {}, [
    h(SettingsFrontend.ViewTopBar, {
      model: input.model.settings,
      dispatch: (c) => input.dispatch({ t: 'settings', c }),
      ctx: frontendCtx,
    }),

    h('div', { class: 'relative flex w-full flex-1 flex-col overflow-hidden' }, [
      h(ViewScreen, {
        model: input.model,
        dispatch: input.dispatch,
        ctx: frontendCtx,
      }),
    ]),

    h(AuthFrontend.ViewModals, {
      ctx: frontendCtx,
      dispatch: (c) => input.dispatch({ t: 'auth', c }),
      model: input.model.auth,
    }),

    h(DrawerPortalExit, {}),

    h(ToasterFrontend.View, {
      ctx: frontendCtx,
      model: input.model.frontend.toast,
      dispatch: (c) => input.dispatch({ t: 'frontend', c: { t: 'toast', c } }),
    }),
  ])
}

const ViewScreen = (input: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (m: MsgFrontend) => void }) => {
  switch (input.model.frontend.currentScreen.currentScreen.n) {
    case 'settings':
      return h(SettingsFrontend.View, {
        ctx: input.ctx,
        dispatch: (c) => input.dispatch({ t: 'settings', c }),
        model: input.model.settings,
      })
    default: {
      const currentUser = toCurrentUserState({ model: input.model.auth.currentUser, ctx: input.ctx })
      switch (currentUser.t) {
        case 'loading':
          return h(SplashScreen, { reason: TranslatedText.of('Loading current user...') })
        case 'logged-out':
          return h(ViewScreenLoggedOut, { model: input.model, dispatch: input.dispatch, ctx: input.ctx })
        case 'logged-in':
          return h(ViewScreenLoggedIn, { model: input.model, dispatch: input.dispatch, ctx: input.ctx })
      }
    }
  }
}

const ViewScreenLoggedOut: typeof ViewScreen = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'auth':
      return h(AuthFrontend.View, {
        model: input.model.auth,
        ctx: input.ctx,
        dispatch: (c) => input.dispatch({ t: 'auth', c }),
      })
    default:
      return h(IntersectionObserverEmitter, {
        id: 'app-intersection-observer',
        onVisible: () =>
          input.dispatch({
            t: 'frontend',
            c: { t: 'current-screen', c: { t: 'clicked-link', screen: { t: 'login', n: 'auth' } } },
          }),
      })
  }
}

const ViewScreenLoggedIn: typeof ViewScreen = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'profile':
      return h(ProfileFrontend.View, {
        dispatch: (m) => input.dispatch({ t: 'profile', c: m }),
        model: input.model.profile,
        ctx: { ...input.ctx, parentScreen: toScreenLayoutProps(input) },
      })

    case 'spaces':
      return h(SpacesFrontend.View, {
        dispatch: (m) => input.dispatch({ t: 'spaces', c: m }),
        model: input.model.spaces,
        ctx: {
          ...input.ctx,
          parentScreen: toScreenLayoutProps(input),
        },
      })

    case 'settings':
    case 'auth':
      return h(IntersectionObserverEmitter, {
        id: 'app-intersection-observer',
        onVisible: () =>
          input.dispatch({
            t: 'frontend',
            c: { t: 'current-screen', c: { t: 'clicked-link', screen: { n: 'spaces', t: 'space-list' } } },
          }),
      })
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
      return h(SpacesFrontend.ViewCurrentSpaceMiniPlayer, {
        key: props.key,
        ctx: input.ctx,
        model: input.model.spaces,
        dispatch: (c) => input.dispatch({ t: 'spaces', c }),
      })
    },
    actionBar: {
      variant: {
        t: 'uniform',
        actions: [
          {
            label: ctx.t('spaces.spaces'),
            icon: (input) => IconGamepad(input),
            color: input.model.frontend.currentScreen.currentScreen.n === 'spaces' ? 'selected' : 'inherit',
            onClick: pushSpaceList,
            id: ctx.t('spaces.spaces'),
          },
          {
            label: ctx.t('profile.profile'),
            icon: (input) => IconUserCircle(input),
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
  init,
  update,
  subscriptions,
  View,
}
