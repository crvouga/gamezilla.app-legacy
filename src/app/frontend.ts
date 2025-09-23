import { IAudioPlayer } from '~/@/audio-player'
import { Eff } from '~/@/eff'
import { HttpClient } from '~/@/http-client'
import { IKeyValueDb } from '~/@/key-value-db'
import { IKeyValueDbSync } from '~/@/key-value-db-sync'
import { IKeyBoard } from '~/@/keyboard'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Msg } from '~/@/msg/msg'
import { INavigation } from '~/@/navigation'
import { IPlatform } from '~/@/platform/platform'
import { Psql } from '~/@/psql'
import { RPC } from '~/@/rpc'
import { Screen } from '~/@/screens/generated/screens'
import { ServerRegistry } from '~/@/server-registry/server-registry'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { ISqlDb } from '~/@/sql-db/interface'
import { Sub } from '~/@/sub'
import { CrudTransactionDb } from '~/@/sync-engine/crud-transaction-db/impl'
import { SyncEngineClient } from '~/@/sync-engine/sync-engine-client'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { TopicClient } from '~/@/topic/topic-client/impl'
import { IconGamepad, IconUser } from '~/@/ui/icon'
import { Url } from '~/@/url/url'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { sx } from '~/@/vdom/style/sx'
import { VdomImplWebStorage } from '~/@/vdom/vdom-impl-web-storage'
import { IViewport } from '~/@/viewport'
import { ClientSessionIdStorage } from '~/@/wire/client-session-id-storage'
import { ILogger } from '../@/logger'
import { APP_SOUND } from './@/frontend/app-sound'
import { AppFrontendCtx, AppFrontendCtxBase, isAppFrontendCtx } from './@/frontend/ctx'
import { PreloadSoundsCmd } from './@/frontend/preload-sounds-cmd.$msg'
import { topicMsgCodec } from './@/topic-msg-codec'
import { AppRoot } from './@/ui/app-root/app-root'
import { SplashScreen } from './@/ui/logo/splash-screen'
import { RedirectScreen } from './@/ui/redirect-screen'
import { ParentScreenProps } from './@/ui/screen/layout/screen-layout-props'
import { toCurrentUserState } from './auth/current-user/frontend'
import { AuthFrontend } from './auth/frontend'
import { LogoutFrontend } from './auth/logout/frontend'
import { FrontendFrontend } from './frontend/frontend'
import { QueryCache } from './frontend/query-cache/query-cache'
import { ToasterFrontend } from './frontend/toaster'
import { ProfileFrontend } from './profile/frontend'
import { SettingsFrontend } from './settings/frontend'
import { SettingsTopBar } from './settings/settings-top-bar'
import { SpacesFrontend } from './spaces/frontend'
import { FrontendCtxModule, ModelFrontend, MsgFrontend, rpcContract, topicContract } from './types'
import { toBackendConnectionStatus } from './wire/backend-connection/backend-connection-status'
import { WireFrontend } from './wire/frontend'

const initCtx = async (config: {
  serverRegistrySrcUrl: Url
  sqlDb: ISqlDb
  logger: ILogger
  keyValueDbSync: IKeyValueDbSync
  audioPlayer: IAudioPlayer
  keyboard: IKeyBoard
  viewport: IViewport
  navigation: INavigation
  platform: IPlatform
  keyValueDb: IKeyValueDb
}): Promise<FrontendCtxModule> => {
  if (typeof document !== 'undefined') {
    document.addEventListener('contextmenu', (e) => e.preventDefault())
    document.addEventListener('selectstart', (e) => e.preventDefault())
  }

  const logger = config.logger.child(['app'])

  const clientSessionIdStorage = ClientSessionIdStorage.init({ keyValueDb: config.keyValueDb })

  const clientSessionId = await clientSessionIdStorage.get()

  const httpClient = HttpClient.init({
    t: 'fetch',
  })

  const navigatorLanguage = LanguageCodeISO_639_1.getLangFromNavigator() ?? 'en'

  const migrationPolicy = SqlDbMigrationPolicy.init({
    t: 'dangerously-wipe-on-new-schema',
    kvDb: config.keyValueDb,
    logger: logger.setMaxLogLevel('debug'),
  })

  const serverRegistry = ServerRegistry.init({
    httpClient,
    logger,
    serverRegistrySrcUrl: config.serverRegistrySrcUrl,
    sqlDb: config.sqlDb,
    migrationPolicy,
    pollRate: TimeSpan.seconds(10),
  })

  const abortController = new AbortController()
  serverRegistry.worker(abortController.signal)

  const topic = TopicClient.init({
    t: 'web-sockets-in-house',
    contract: topicContract,
    clientSessionId,
    logger,
    codec: topicMsgCodec,
    getServerUrls: serverRegistry.getServerUrls,
    reconnectionRate: TimeSpan.seconds(0),
    syncSubscriptionRate: TimeSpan.seconds(0),
  })

  const psql = Psql({
    sqlDb: config.sqlDb,
  })
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.q = psql.psql
  }

  const rpc = RPC.initClient({
    t: 'http',
    contract: rpcContract,
    serverUrl: Url.derive('', 'http'),
    clientSessionId,
    httpClient,
  })

  const crudTransactionDb = CrudTransactionDb.init({
    t: 'sql-db',
    logger,
    sqlDb: config.sqlDb,
    migrationPolicy,
  })

  const syncEngine = SyncEngineClient.init({
    logger: logger.setMaxLogLevel('debug'),
    crudTransactionDb,
  })

  const vdomImplStorage = VdomImplWebStorage.init({ keyValueDb: config.keyValueDb })

  const ctx: AppFrontendCtxBase = {
    vdomImpl: await vdomImplStorage.get(),
    platform: config.platform,
    syncEngine,
    migrationPolicy,
    audioPlayer: config.audioPlayer,
    keyboard: config.keyboard,
    viewport: config.viewport,
    navigation: config.navigation,
    clientSessionId,
    sqlDb: config.sqlDb,
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
    keyValueDb: config.keyValueDb,
    queryCache: QueryCache.init,
  }

  const auth = await AuthFrontend.initCtx({ ctx, rpc })
  const profile = ProfileFrontend.initCtx({ ctx })
  const spaces = await SpacesFrontend.initCtx({ ctx, rpc, topic })
  const wire = WireFrontend.initCtx({ ctx, topic })

  const ctxModule: FrontendCtxModule = {
    ...ctx,
    ...auth,
    ...profile,
    ...spaces,
    ...wire,
    rpc,
    topic,
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
    backendConnectionStatus: toBackendConnectionStatus(input.model.wire.backendConnection),
    queryCache: input.model.frontend.queryCache,
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

  return updateLoop(input.ctx, { model, eff, msgOut })
}

const update = (input: {
  ctx: FrontendCtxModule
  msg: MsgFrontend
  model: ModelFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  return updateLoop(input.ctx, updateChild(input))
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

const View = (props: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  const frontendCtx = toCtx(props)

  return h(AppRoot, {}, [
    h(SettingsTopBar.View, {
      model: props.model.settings,
      dispatch: (c) => props.dispatch({ t: 'settings', c }),
      ctx: frontendCtx,
    }),

    h(
      Box,
      {
        style: sx({
          flexDirection: 'col',
          width: 'full',
          flex: 1,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }),
      },
      [
        h(ViewScreen, {
          model: props.model,
          dispatch: props.dispatch,
          ctx: frontendCtx,
        }),
      ],
    ),

    h(ToasterFrontend.View, {
      ctx: frontendCtx,
      model: props.model.frontend.toast,
      dispatch: (c) => props.dispatch({ t: 'frontend', c: { t: 'toast', c } }),
    }),
  ])
}

const ViewScreen = (props: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (m: MsgFrontend) => void }) => {
  switch (props.model.frontend.currentScreen.currentScreen.n) {
    case 'settings':
      return h(SettingsFrontend.View, {
        ctx: props.ctx,
        dispatch: (c) => props.dispatch({ t: 'settings', c }),
        model: props.model.settings,
        slots: {
          menuItemsEnd() {
            return h(LogoutFrontend.ViewMenuItem, {
              ctx: props.ctx,
              dispatch: (c) => props.dispatch({ t: 'auth', c: { t: 'got-logout-msg', c } }),
              model: props.model.auth.logout,
            })
          },
        },
      })
    default: {
      const currentUser = toCurrentUserState({ model: props.model.auth.currentUser, ctx: props.ctx })
      switch (currentUser.t) {
        case 'loading':
          return h(SplashScreen, {})
        case 'logged-out':
          return h(ViewScreenLoggedOut, { model: props.model, dispatch: props.dispatch, ctx: props.ctx })
        case 'logged-in':
          return h(ViewScreenLoggedIn, { model: props.model, dispatch: props.dispatch, ctx: props.ctx })
      }
    }
  }
}

const ViewScreenLoggedOut: typeof ViewScreen = (props) => {
  switch (props.ctx.currentScreen.n) {
    case 'auth':
      return h(AuthFrontend.View, {
        model: props.model.auth,
        ctx: props.ctx,
        dispatch: (c) => props.dispatch({ t: 'auth', c }),
      })
    default:
      return h(RedirectScreen, {
        onPress: () =>
          props.dispatch({
            t: 'frontend',
            c: { t: 'current-screen', c: { t: 'clicked-link', screen: { t: 'login', n: 'auth' } } },
          }),
        buttonText: props.ctx.t('login'),
        text: props.ctx.t('login'),
      })
  }
}

const ViewScreenLoggedIn: typeof ViewScreen = (props) => {
  const ctx = { ...props.ctx, parentScreen: toScreenLayoutProps(props) }

  switch (props.ctx.currentScreen.n) {
    case 'profile':
      return h(ProfileFrontend.View, {
        dispatch: (m) => props.dispatch({ t: 'profile', c: m }),
        model: props.model.profile,
        ctx,
      })

    case 'spaces':
      return h(SpacesFrontend.View, {
        dispatch: (m) => props.dispatch({ t: 'spaces', c: m }),
        model: props.model.spaces,
        ctx,
      })

    case 'settings':
    case 'auth':
      return h(RedirectScreen, {
        onPress: () =>
          props.dispatch({
            t: 'frontend',
            c: { t: 'current-screen', c: { t: 'clicked-link', screen: { t: 'space-list', n: 'spaces' } } },
          }),
        buttonText: props.ctx.t('spaces.spaces'),
        text: props.ctx.t('spaces.spaces'),
      })
  }
}

const toScreenLayoutProps = (props: {
  ctx: AppFrontendCtx | AppFrontendCtxBase
  model: ModelFrontend
  dispatch: (m: MsgFrontend) => void
}): ParentScreenProps | null => {
  const { ctx } = props
  if (!isAppFrontendCtx(ctx)) return null
  const screenSpace: Screen = { n: 'spaces', t: 'space-list' }
  const screenProfile: Screen = { n: 'profile', t: 'profile', userId: ctx.currentUser.userId }
  const pushSpaceList = () =>
    props.dispatch({ t: 'frontend', c: { t: 'current-screen', c: { t: 'clicked-link', screen: screenSpace } } })
  return {
    id: 'app-screen-layout',
    parentScreen: null,
    renderMiniPlayer: (propsMiniPlayer) => {
      return h(SpacesFrontend.ViewCurrentSpaceMiniPlayer, {
        ctx,
        key: propsMiniPlayer.key,
        model: props.model.spaces,
        dispatch: (c) => props.dispatch({ t: 'spaces', c }),
      })
    },
    actionBar: {
      variant: {
        t: 'uniform',
        actions: [
          {
            label: ctx.t('spaces.spaces'),
            renderIcon: (iconProps) => h(IconGamepad, iconProps),
            color: props.model.frontend.currentScreen.currentScreen.n === 'spaces' ? 'selected' : 'inherit',
            onPress: pushSpaceList,
            id: ctx.t('spaces.spaces'),
          },
          {
            label: ctx.t('profile.profile'),
            renderIcon: (iconProps) => h(IconUser, iconProps),
            color: props.model.frontend.currentScreen.currentScreen.n === 'profile' ? 'selected' : 'inherit',
            onPress() {
              props.dispatch({
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
