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
import { andThen } from './@/frontend/and-then'
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
import { FrontendCtxModule, isMsgFrontendBase, ModelFrontend, MsgFrontend, rpcContract, topicContract } from './types'
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
  const currentUserState = toCurrentUserState({ model: input.model, ctx: input.ctx })

  const baseCtx: FrontendCtxModule = {
    ...input.ctx,
    now: UnixMs.now(),
    t: Translator(input.model.lang_lang ?? 'en'),
    profilesByUserId: input.model.profiles_profilesByUserId ?? {},
    viewportVisibility: input.model.viewport_visibility,
    currentScreen: input.model.currentScreen_screen,
    screenSize: input.model.screenSize_screenSize,
    parentScreen: null,
    currentUserState,
    currentUser: currentUserState.t === 'logged-in' ? currentUserState.userAccount : null,
    backendConnectionStatus: toBackendConnectionStatus(input.model),
    queryCache: input.model,
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

  const ctx: FrontendCtxModule = {
    ...input.ctx,
    currentScreen: currentScreen.model.currentScreen_screen,
    viewportVisibility: viewport.model.viewport_visibility,
    screenSize: screenSize.model.screenSize_screenSize,
  }

  const settings = SettingsFrontend.init({ ctx })
  const space = SpacesFrontend.init({ ctx })

  const model: ModelFrontend = {
    ...focus.model,
    ...currentScreen.model,
    ...toast.model,
    ...viewport.model,
    ...screenSize.model,
    ...copyToClipboard.model,
    ...queryCache.model,
    ...space.model,
    ...settings.model,
  }

  const eff = Eff.batch<MsgFrontend>([currentScreen.eff, settings.eff])

  return {
    model,
    eff,
  }
}

const update = (input: {
  ctx: FrontendCtxModule
  msg: unknown
  model: ModelFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  const ctx = toCtx(input)
  const result = updateMain({ ...input, ctx })
  const allEffects = [result.eff]
  while (result.msgOut?.length) {
    const msgOut = result.msgOut.shift()!
    const updated = updateMain({ ctx, model: result.model, msgIn: msgOut, msg: msgOut })
    result.model = updated.model
    if (updated.eff) allEffects.push(updated.eff)
    if (updated.msgOut) result.msgOut.push(...updated.msgOut)
  }
  return {
    model: result.model,
    eff: Eff.batch(allEffects),
  }
}

const updateMain = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg?: unknown
  msgIn?: unknown
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  return andThen<ModelFrontend, MsgFrontend>(
    input,
    (model) => SpacesFrontend.update({ ...input, model }),
    (model) => ProfileFrontend.update({ ...input, model }),
    (model) => AuthFrontend.update({ ...input, model }),
    (model) => WireFrontend.update({ ...input, model }),
    (model) => SettingsFrontend.update({ ...input, model }),
    (model) => CurrentScreenFrontend.update({ ...input, model }),
    (model) => ViewportFrontend.update({ ...input, model }),
    (model) => ToasterFrontend.update({ ...input, model }),
    (model) => ScreenSizeFrontend.update({ ...input, model }),
    (model) => CopyToClipboardFrontend.update({ ...input, model }),
    (model) => FocusFrontend.update({ ...input, model }),
    (model) => QueryCache.update({ ...input, model }),
    (model) => updateFromMsgFrontendBase({ ...input, model }),
  )
}

const externalMsgs = Sub.init<unknown>()

const updateFromMsgFrontendBase: typeof updateMain = (input) => {
  if (!isMsgFrontendBase(input.msg)) return { model: input.model }
  switch (input.msg?.t) {
    case 'app_gotMsgOut': {
      return { model: input.model, msgOut: [input.msg.c] }
    }
  }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  const ctx = toCtx(input)
  const inputNew = { ...input, ctx }
  return Sub.batch<MsgFrontend>([
    Sub.map(externalMsgs, (c) => ({ t: 'app_gotMsgOut', c })),
    ViewportFrontend.subscriptions(inputNew),
    FocusFrontend.subscriptions,
    CopyToClipboardFrontend.subscriptions,
    ScreenSizeFrontend.subscriptions(inputNew),
    CurrentScreenFrontend.subscriptions(inputNew),
    ToasterFrontend.subscriptions(inputNew),
    WireFrontend.subscriptions(inputNew),
    SettingsFrontend.subscriptions(inputNew),
    AuthFrontend.subscriptions(inputNew),
    ProfileFrontend.subscriptions(inputNew),
    SpacesFrontend.subscriptions(inputNew),
  ])
}

const View = (props: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  const frontendCtx = toCtx(props)

  return h(AppRoot, {}, [
    h(SettingsTopBar.View, {
      model: props.model,
      dispatch: (c) => props.dispatch(c),
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
      model: props.model,
      dispatch: (c) => props.dispatch(c),
    }),
  ])
}

const ViewScreen = (props: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (m: MsgFrontend) => void }) => {
  const ctx = {
    ...props.ctx,
    parentScreen: toScreenLayoutProps(props),
  }

  switch (props.model.currentScreen_screen.n) {
    case 'settings':
      return h(SettingsFrontend.View, {
        ctx: props.ctx,
        dispatch: (c) => props.dispatch(c),
        model: props.model,
        slots: {
          menuItemsEnd() {
            return h(LogoutFrontend.ViewMenuItem, {
              ctx: props.ctx,
              dispatch: (c) => props.dispatch(c),
              model: props.model,
            })
          },
        },
      })

    case 'auth':
      return h(AuthFrontend.View, {
        model: props.model,
        ctx: props.ctx,
        dispatch: (c) => props.dispatch(c),
      })

    case 'profile':
      return h(ProfileFrontend.View, {
        dispatch: (m) => props.dispatch(m),
        model: props.model,
        ctx,
      })

    case 'spaces':
      return h(SpacesFrontend.View, {
        dispatch: (m) => props.dispatch(m),
        model: props.model,
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
      t: 'currentScreen_clickedLink',
      screen: screenSpace,
    })
  return {
    id: 'app-screen-layout',
    parentScreen: null,
    renderMiniPlayer: (propsMiniPlayer) => {
      return h(SpacesFrontend.ViewCurrentSpaceMiniPlayer, {
        ctx,
        key: propsMiniPlayer.key,
        model: props.model,
        dispatch: (c) => props.dispatch(c),
      })
    },
    actionBar: {
      variant: {
        t: 'uniform',
        actions: [
          {
            label: ctx.t('spaces.spaces'),
            renderIcon: (iconProps) => h(IconGamepad, iconProps),
            color: props.model.currentScreen_screen.n === 'spaces' ? 'selected' : 'inherit',
            onPress: pushSpaceList,
            id: ctx.t('spaces.spaces'),
          },
          {
            label: ctx.t('profile.profile'),
            renderIcon: (iconProps) => h(IconUser, iconProps),
            color: props.model.currentScreen_screen.n === 'profile' ? 'selected' : 'inherit',
            onPress() {
              props.dispatch({
                t: 'currentScreen_clickedLink',
                screen: screenProfile,
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
  externalMsgs,
  initCtx,
  init,
  update,
  subscriptions,
  View,
}
