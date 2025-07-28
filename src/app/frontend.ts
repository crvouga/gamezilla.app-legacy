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
import { RPC } from '~/@/rpc'
import { Screen } from '~/@/screens/generated/screens'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { ISqlDb } from '~/@/sql-db/interface'
import { Sub } from '~/@/sub'
import { CrudTransactionDb } from '~/@/sync-engine/crud-transaction-db/impl'
import { SyncEngineClient } from '~/@/sync-engine/sync-engine-client'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { TopicClient } from '~/@/topic/topic-client/topic-client'
import { Button } from '~/@/ui/button'
import { IconGamepad, IconUser } from '~/@/ui/icon'
import { Url } from '~/@/url/url'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { IViewport } from '~/@/viewport'
import { ClientSessionIdStorage } from '~/@/wire/client-session-id-storage'
import { ILogger } from '../@/logger'
import { APP_SOUND } from './@/frontend/app-sound'
import { AppFrontendCtx, AppFrontendCtxBase, isAppFrontendCtx } from './@/frontend/ctx'
import { PreloadSoundsCmd } from './@/frontend/preload-sounds-cmd.$msg'
import { topicMsgCodec } from './@/topic-msg-codec'
import { AppRoot } from './@/ui/app-root/app-root'
import { SplashScreen } from './@/ui/logo/splash-screen'
import { ParentScreenProps } from './@/ui/screen/layout/screen-layout-props'
import { toCurrentUserState } from './auth/current-user/frontend'
import { AuthFrontend } from './auth/frontend'
import { FrontendFrontend } from './frontend/frontend'
import { QueryCache } from './frontend/query-cache/query-cache'
import { ToasterFrontend } from './frontend/toaster'
import { ProfileFrontend } from './profile/frontend'
import { SettingsFrontend } from './settings/frontend'
import { SpacesFrontend } from './spaces/frontend'
import { FrontendCtxModule, ModelFrontend, MsgFrontend, rpcContract, topicContract } from './types'
import { toBackendConnectionStatus } from './wire/backend-connection/backend-connection-status'
import { WireFrontend } from './wire/frontend'
import { VdomImplWebStorage } from '~/@/vdom/vdom-impl-web-storage'

const initCtx = async (config: {
  backendUrl: Url
  topicUrl: Url
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
  if (config.platform === 'web') {
    document.addEventListener('contextmenu', (e) => e.preventDefault())
    document.addEventListener('selectstart', (e) => e.preventDefault())
  }

  const logger = config.logger.child(['app'])

  const clientSessionId = await ClientSessionIdStorage.init({ keyValueDb: config.keyValueDb }).get()

  const httpClient = HttpClient.init({
    t: 'fetch',
  })

  const rpc = RPC.initClient({
    t: 'http',
    contract: rpcContract,
    serverUrl: config.backendUrl,
    clientSessionId,
    httpClient,
  })

  const topic = TopicClient.init({
    t: 'web-sockets',
    contract: topicContract,
    serverUrl: config.topicUrl,
    clientSessionId,
    logger,
    endpoint: '/topic',
    reconnectionRate: TimeSpan.seconds(3),
    syncSubscriptionRate: TimeSpan.seconds(3),
    codec: topicMsgCodec,
  })

  const navigatorLanguage = LanguageCodeISO_639_1.getLangFromNavigator() ?? 'en'

  const migrationPolicy = SqlDbMigrationPolicy.init({
    t: 'dangerously-wipe-on-new-schema',
    kvDb: config.keyValueDb,
    logger: logger.setMaxLogLevel('debug'),
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

  const vdomImplStorage = VdomImplWebStorage.init({ keyValueDb: config.keyValueDb, fallback: 'inferno' })

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

const View = (input: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  const frontendCtx = toCtx(input)

  return h(AppRoot, {}, [
    h(SettingsFrontend.ViewTopBar, {
      model: input.model.settings,
      dispatch: (c) => input.dispatch({ t: 'settings', c }),
      ctx: frontendCtx,
    }),

    h(Box, { class: 'relative flex w-full flex-1 flex-col overflow-hidden' }, [
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
          return h(SplashScreen, {})
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
      return h(Box, { class: 'flex w-full flex-1 items-center justify-center' }, [
        Text({ text: 'Logged out', class: 'text-white' }),
        h(
          Button,
          {
            variant: 'contained',
            color: 'primary',
            onPress: () =>
              input.dispatch({
                t: 'frontend',
                c: { t: 'current-screen', c: { t: 'clicked-link', screen: { t: 'login', n: 'auth' } } },
              }),
            text: input.ctx.t('login'),
          },
          [Text({ text: 'Login' })],
        ),
      ])
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
      return h(Box, { class: 'flex w-full flex-1 items-center justify-center' }, [
        Text({ text: 'Logged in', class: 'text-white' }),
        h(
          Button,
          {
            variant: 'contained',
            color: 'primary',
            onPress: () =>
              input.dispatch({
                t: 'frontend',
                c: { t: 'current-screen', c: { t: 'clicked-link', screen: { t: 'space-list', n: 'spaces' } } },
              }),
            text: input.ctx.t('spaces.spaces'),
          },
          [],
        ),
      ])
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
            icon: (input) => h(IconGamepad, input),
            color: input.model.frontend.currentScreen.currentScreen.n === 'spaces' ? 'selected' : 'inherit',
            onPress: pushSpaceList,
            id: ctx.t('spaces.spaces'),
          },
          {
            label: ctx.t('profile.profile'),
            icon: (input) => h(IconUser, input),
            color: input.model.frontend.currentScreen.currentScreen.n === 'profile' ? 'selected' : 'inherit',
            onPress() {
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
