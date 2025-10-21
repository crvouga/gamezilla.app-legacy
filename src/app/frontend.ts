import { IAudioPlayer } from '~/@/audio-player'
import { Eff } from '~/@/eff'
import { HttpClient } from '~/@/http-client'
import { IKeyValueDb } from '~/@/key-value-db'
import { IKeyValueDbSync } from '~/@/key-value-db-sync'
import { IKeyBoard } from '~/@/keyboard'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
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
import { AppFrontendCtx, AppFrontendCtxBase, isAppFrontendCtx } from './@/frontend/ctx'
import { topicMsgCodec } from './@/topic-msg-codec'
import { AppRoot } from './@/ui/app-root/app-root'
import { ParentScreenProps } from './@/ui/screen/layout/screen-layout-props'
import { toCurrentUserState } from './auth/current-user/frontend'
import { AuthFrontend } from './auth/frontend'
import { LogoutFrontend } from './auth/logout'
import { CopyToClipboardFrontend } from './frontend/copy-to-clipboard'
import { CurrentScreenFrontend } from './frontend/current-screen'
import { FocusFrontend } from './frontend/focus'
import { QueryCache } from './frontend/query-cache'
import { ScreenSizeFrontend } from './frontend/screen-size'
import { ToasterFrontend } from './frontend/toaster'
import { ViewportFrontend } from './frontend/viewport'
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
    currentScreen: { n: 'auth', t: 'auth_login' },
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
    queryCache: QueryCache.init({}).model,
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
    t: Translator(input.model.settings.lang_lang ?? 'en'),
    profilesByUserId: input.model.profile.profiles_profilesByUserId ?? {},
    viewportVisibility: input.model.viewport.viewport_visibility,
    currentScreen: input.model.currentScreen.currentScreen_screen,
    screenSize: input.model.screenSize.screenSize_screenSize,
    parentScreen: null,
    currentUserState,
    currentUser: currentUserState.t === 'logged-in' ? currentUserState.userAccount : null,
    backendConnectionStatus: toBackendConnectionStatus(input.model.wire.backendConnection),
    queryCache: input.model.queryCache,
  }

  return baseCtx
}

const init = (input: { ctx: FrontendCtxModule }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  const currentScreen = CurrentScreenFrontend.init(input)
  const viewport = ViewportFrontend.init(input)
  const screenSize = ScreenSizeFrontend.init(input)
  const toast = ToasterFrontend.init(input)
  const focus = FocusFrontend.init(input)
  const copyToClipboard = CopyToClipboardFrontend.init(input)
  const queryCache = QueryCache.init(input)
  const profile = ProfileFrontend.init(input)
  const wire = WireFrontend.init(input)
  const auth = AuthFrontend.init(input)

  const ctx: FrontendCtxModule = {
    ...input.ctx,
    currentScreen: currentScreen.model.currentScreen_screen,
    viewportVisibility: viewport.model.viewport_visibility,
    screenSize: screenSize.model.screenSize_screenSize,
  }

  const settings = SettingsFrontend.init({ ctx })
  const space = SpacesFrontend.init({ ctx })

  const model: ModelFrontend = {
    currentScreen: currentScreen.model,
    toaster: toast.model,
    viewport: viewport.model,
    screenSize: screenSize.model,
    copyToClipboard: copyToClipboard.model,
    queryCache: queryCache.model,
    focus: focus.model,
    spaces: space.model,
    settings: settings.model,
    profile: profile.model,
    wire: wire.model,
    auth: auth.model,
  }

  const eff = Eff.batch<MsgFrontend>([
    Eff.tag('currentScreen', currentScreen.eff),
    Eff.tag('settings', settings.eff),
    Eff.tag('wire', wire.eff),
    Eff.tag('auth', auth.eff),
  ])

  return {
    model,
    eff,
  }
}

const update = (input: {
  ctx: FrontendCtxModule
  msg: MsgFrontend
  model: ModelFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  switch (input.msg.t) {
    case 'auth': {
      const updated = AuthFrontend.update({
        ctx: input.ctx,
        model: input.model.auth,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, auth: updated.model },
        eff: Eff.tag('auth', updated.eff),
      }
    }
    case 'spaces': {
      const updated = SpacesFrontend.update({
        ctx: input.ctx,
        model: input.model.spaces,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, spaces: updated.model },
        eff: Eff.tag('spaces', updated.eff),
      }
    }
    case 'profile': {
      const updated = ProfileFrontend.update({
        ctx: input.ctx,
        model: input.model.profile,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, profile: updated.model },
        eff: Eff.tag('profile', updated.eff),
      }
    }
    case 'wire': {
      const updated = WireFrontend.update({
        ctx: input.ctx,
        model: input.model.wire,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, wire: updated.model },
        eff: Eff.tag('wire', updated.eff),
      }
    }
    case 'settings': {
      const updated = SettingsFrontend.update({
        ctx: input.ctx,
        model: input.model.settings,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, settings: updated.model },
        eff: Eff.tag('settings', updated.eff),
      }
    }
    case 'currentScreen': {
      const updated = CurrentScreenFrontend.update({
        ctx: input.ctx,
        model: input.model.currentScreen,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, currentScreen: updated.model },
        eff: Eff.tag('currentScreen', updated.eff),
      }
    }
    case 'viewport': {
      const updated = ViewportFrontend.update({
        ctx: input.ctx,
        model: input.model.viewport,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, viewport: updated.model },
        eff: Eff.tag('viewport', updated.eff),
      }
    }
    case 'toaster': {
      const updated = ToasterFrontend.update({
        ctx: input.ctx,
        model: input.model.toaster,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, toaster: updated.model },
        eff: Eff.tag('toaster', updated.eff),
      }
    }
    case 'screenSize': {
      const updated = ScreenSizeFrontend.update({
        ctx: input.ctx,
        model: input.model.screenSize,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, screenSize: updated.model },
        eff: Eff.tag('screenSize', updated.eff),
      }
    }
    case 'copyToClipboard': {
      const updated = CopyToClipboardFrontend.update({
        ctx: input.ctx,
        model: input.model.copyToClipboard,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, copyToClipboard: updated.model },
        eff: Eff.tag('copyToClipboard', updated.eff),
      }
    }
    case 'focus': {
      const updated = FocusFrontend.update({
        ctx: input.ctx,
        model: input.model.focus,
        msg: input.msg.c,
      })
      return {
        model: { ...input.model, focus: updated.model },
        eff: Eff.tag('focus', updated.eff),
      }
    }
  }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  const ctx = toCtx(input)
  const inputNew = { ...input, ctx }
  return Sub.batch<MsgFrontend>([
    Sub.map(ViewportFrontend.subscriptions(inputNew), (c) => ({ t: 'viewport', c })),
    Sub.map(FocusFrontend.subscriptions, (c) => ({ t: 'focus', c })),
    Sub.map(CopyToClipboardFrontend.subscriptions, (c) => ({ t: 'copyToClipboard', c })),
    Sub.map(ScreenSizeFrontend.subscriptions(inputNew), (c) => ({ t: 'screenSize', c })),
    Sub.map(CurrentScreenFrontend.subscriptions(inputNew), (c) => ({ t: 'currentScreen', c })),
    Sub.map(ToasterFrontend.subscriptions({ ...input, model: input.model.toaster }), (c) => ({ t: 'toaster', c })),
    Sub.map(WireFrontend.subscriptions({ ...input, model: input.model.wire }), (c) => ({ t: 'wire', c })),
    Sub.map(SettingsFrontend.subscriptions({ ...input, model: input.model.settings }), (c) => ({ t: 'settings', c })),
    Sub.map(AuthFrontend.subscriptions({ ...input, model: input.model.auth }), (c) => ({ t: 'auth', c })),
    Sub.map(ProfileFrontend.subscriptions({ ...input, model: input.model.profile }), (c) => ({ t: 'profile', c })),
    Sub.map(SpacesFrontend.subscriptions({ ...input, model: input.model.spaces }), (c) => ({ t: 'spaces', c })),
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
      model: props.model.toaster,
      dispatch: (c) => props.dispatch({ t: 'toaster', c }),
    }),
  ])
}

const ViewScreen = (props: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (m: MsgFrontend) => void }) => {
  const ctx = {
    ...props.ctx,
    parentScreen: toScreenLayoutProps(props),
  }

  switch (props.model.currentScreen.currentScreen_screen.n) {
    case 'settings':
      return h(SettingsFrontend.View, {
        ctx: props.ctx,
        dispatch: (c) => props.dispatch({ t: 'settings', c }),
        model: props.model.settings,
        slots: {
          menuItemsEnd() {
            return h(LogoutFrontend.ViewMenuItem, {
              ctx: props.ctx,
              dispatch: (c) => props.dispatch({ t: 'auth', c: { t: 'logout', c: c } }),
              model: props.model.auth.logout,
            })
          },
        },
      })

    case 'auth':
      return h(AuthFrontend.View, {
        model: props.model.auth,
        ctx: props.ctx,
        dispatch: (c) => props.dispatch({ t: 'auth', c: c }),
      })

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
  }
}

const toScreenLayoutProps = (props: {
  ctx: AppFrontendCtx | AppFrontendCtxBase
  model: ModelFrontend
  dispatch: (m: MsgFrontend) => void
}): ParentScreenProps | null => {
  const { ctx } = props
  if (!isAppFrontendCtx(ctx)) return null
  const screenSpace: Screen = { n: 'spaces', t: 'spaces_list' }
  const screenProfile: Screen = { n: 'profile', t: 'profile_profile', userId: ctx.currentUser.userId }
  const pushSpaceList = () =>
    props.dispatch({
      t: 'currentScreen',
      c: { n: 'currentScreen', t: 'currentScreen_clickedLink', screen: screenSpace },
    })
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
            color: props.model.currentScreen.currentScreen_screen.n === 'spaces' ? 'selected' : 'inherit',
            onPress: pushSpaceList,
            id: ctx.t('spaces.spaces'),
          },
          {
            label: ctx.t('profile.profile'),
            renderIcon: (iconProps) => h(IconUser, iconProps),
            color: props.model.currentScreen.currentScreen_screen.n === 'profile' ? 'selected' : 'inherit',
            onPress() {
              props.dispatch({
                t: 'currentScreen',
                c: { n: 'currentScreen', t: 'currentScreen_clickedLink', screen: screenProfile },
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
