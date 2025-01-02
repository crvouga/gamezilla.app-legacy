import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import { eq } from '~/@/equals/equals'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { Msg } from '~/@/msg/msg'
import type { Route } from '~/@/routing/generated/routes'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { WebClient } from '~/@/web-client'
import { IconGamepad, IconUserCircle, LoadingState, Portal } from '~/app/@/ui'
import { SERVER_IMPL, SERVER_URL, type ServerImpl } from '~/config-public'
import { ILogger, Logger } from '../@/logger'
import { APP_SOUND, AppClientCmd, preloadSound } from './@/client/cmd'
import { AnonymousClientCtx, AppClientCtx, BaseClientCtx, isAppClientCtx } from './@/client/ctx'
import { ClientEvt } from './@/client/evt'
import { Translator } from './@/client/translator'
import { BottomButtons } from './@/ui/bottom-buttons'
import { IntersectionObserverEmitter } from './@/ui/intersection-observer'
import { Platform, Routing, Sound, StatusBar, Toast } from './app-client'
import * as AuthClient from './auth/client'
import * as LangClient from './lang/client'
import * as ProfileClient from './profile/client'
import { SpacesClient } from './spaces/client'
import {
  rpcContract,
  type ClientCtx,
  type ModelClient,
  type MsgClient,
  type MsgToClient,
  type MsgToServer
} from './types'
import * as WireClient from './wire/client'
import { ClientTransport } from './wire/transport/client'

//
//
//
// Transport
//
//
//

const toClientTransportConfig = (input: {
  serverImpl: ServerImpl
  serverUrl: string
  logger: ILogger
}): Parameters<typeof ClientTransport>[0] => {
  switch (input.serverImpl) {
    case 'bun': {
      return {
        ...input,
        t: 'standard-web-sockets'
      }
    }
    case 'node': {
      return {
        ...input,
        t: 'noop'
      }
    }
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

export const initCtx = async (): Promise<ClientCtx> => {
  const logger = Logger({ t: 'console' })

  const transport = await ClientTransport<MsgToServer, MsgToClient>(
    toClientTransportConfig({
      serverImpl: SERVER_IMPL,
      serverUrl: SERVER_URL,
      logger
    })
  )

  const webClient = WebClient({
    t: 'fetch',
    fetch: fetch as Fetch
  })

  const rpc = RPC.initClient(webClient, rpcContract)

  return {
    rpc,
    stored: {},
    transport,
    now: Posix.now(),
    location: Browser.location(),
    navigatorLanguage: LanguageCodeISO_639_1.getLangFromNavigator() ?? 'en'
  }
}

export const updateCtx = (ctx: ClientCtx): ClientCtx => {
  return {
    ...ctx,
    now: Posix.now()
  }
}

export const init = (input: {
  ctx: ClientCtx
}): {
  model: ModelClient
  eff?: Eff<MsgClient>
} => {
  const routing = Routing.init({ location: input.ctx.location })

  const ctx: AnonymousClientCtx = {
    ...input.ctx,
    currentRoute: routing.model.currentRoute,
    t: Translator(input.ctx.navigatorLanguage),
    currentUserId: null,
    documentVisibilityState: 'visible',
    profiles: {}
  }

  const lang = LangClient.init({ ctx, stored: input.ctx.stored })
  const toast = Toast.init({ stored: input.ctx.stored, ctx })
  const wire = WireClient.init({
    ctx: {
      ...ctx,
      rpc: input.ctx.rpc.wire
    },
    stored: input.ctx.stored
  })
  const auth = AuthClient.init({ stored: input.ctx.stored, ctx })
  const space = SpacesClient.init({ ctx, stored: input.ctx.stored })
  const profile = ProfileClient.init({ ctx, stored: input.ctx.stored })
  const sound = Sound.init({ ctx, stored: input.ctx.stored })
  const platform = Platform.init({ stored: input.ctx.stored })
  const statusBar = StatusBar.init({ stored: input.ctx.stored })

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
    lang: lang.model
  }

  const initialEff = Eff.batch<MsgClient>([routing.eff, Eff.tag('auth', auth.eff), Eff.tag('lang', lang.eff)])

  const initialCmd = Msg.batch<
    AppClientCmd<{
      MsgToServer: MsgToServer
      MsgClient: MsgClient
    }>
  >(
    AppClientCmd.tag('spaces', space.msgCmd),
    AppClientCmd.tag('profile', profile.msgCmd),
    AppClientCmd.tag('auth', auth.msgCmd),
    AppClientCmd.tag('lang', lang.msgCmd),

    preloadSound(Object.values(APP_SOUND))
  )

  const updated = updateLoop(input.ctx, {
    model: initialModel,
    eff: initialEff,
    msgCmd: initialCmd,
    msgEvt: []
  })

  return {
    model: updated.model,
    eff: updated.eff
  }
}

//
//
//
//
//

const toClientCtx = (input: { model: ModelClient; ctx: ClientCtx }): AppClientCtx | AnonymousClientCtx => {
  const anonymousCtx: AnonymousClientCtx = {
    ...input.ctx,
    t: Translator(input.model.lang.lang),
    profiles: input.model.profile.profiles,
    now: input.ctx.now,
    documentVisibilityState: input.model.platform.documentVisibilityState,
    currentRoute: input.model.routing.currentRoute,
    currentUserId: null
  }
  if (input.model.auth.currentUser.t === 'logged-in') {
    return {
      ...anonymousCtx,
      currentUser: input.model.auth.currentUser.account,
      currentUserRole: input.model.auth.currentUser.account.role,
      currentUserId: input.model.auth.currentUser.account.userId
    }
  }
  return anonymousCtx
}

//
//
//
// Update
//
//
//

export const update = (input: {
  ctx: ClientCtx
  msg: MsgClient
  model: ModelClient
}): {
  model: ModelClient
  eff?: Eff<MsgClient>
} => {
  const msgServer = input.msg.t === '→' ? input.msg.c : undefined
  const updatedFromMsg = updateChild({
    ctx: input.ctx,
    model: input.model,
    msg: input.msg,
    msgServer: msgServer
  })

  const updated = updateLoop(input.ctx, updatedFromMsg)

  return updated
}

type Output = {
  model: ModelClient
  eff: Eff<MsgClient>
  msgEvt: ClientEvt[]
  msgCmd: AppClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>[]
}

const updateLoop = (ctx: ClientCtx, acc: Output): Output => {
  const [msgCmd, ...msgCmdRest] = acc.msgCmd

  if (msgCmd) {
    const updatedCmd = updateChild({
      ctx,
      model: acc.model,
      msgCmd
    })
    return updateLoop(ctx, {
      model: updatedCmd.model,
      msgCmd: Msg.batch(msgCmdRest, updatedCmd.msgCmd),
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
      msgEvt: Msg.batch(acc.msgEvt, updatedCmd.msgEvt)
    })
  }

  const [msgEvt, ...msgEvtRest] = acc.msgEvt

  if (msgEvt) {
    const updatedEvt = updateChild({
      ctx,
      model: acc.model,
      msgEvt
    })
    return updateLoop(ctx, {
      model: updatedEvt.model,
      msgCmd: Msg.batch(msgCmdRest, updatedEvt.msgCmd),
      eff: Eff.batch([acc.eff, updatedEvt.eff]),
      msgEvt: Msg.batch(msgEvtRest, updatedEvt.msgEvt)
    })
  }

  return acc
}

const updateChild = (input: {
  ctx: ClientCtx
  model: ModelClient
  msg?: MsgClient
  msgServer?: MsgToClient
  msgEvt?: ClientEvt
  msgCmd?: AppClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
}): Output => {
  const clientCtx = toClientCtx(input)

  const space = SpacesClient.update({
    ctx: clientCtx,
    model: input.model.spaces,
    msg: input.msg?.t === 'spaces' ? input.msg.c : null,
    msgServer: input.msgServer?.t === 'spaces' ? input.msgServer.c : null,
    msgEvt: input.msgEvt,
    msgCmd: null
  })

  const profile = ProfileClient.update({
    ctx: clientCtx,
    model: input.model.profile,
    msg: input.msg?.t === 'profile' ? input.msg.c : null,
    msgServer: input.msgServer?.t === 'profile' ? input.msgServer.c : null,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd?.t === 'profile' ? input.msgCmd : null
  })

  const auth = AuthClient.update({
    ctx: clientCtx,
    model: input.model.auth,
    msg: input.msg?.t === 'auth' ? input.msg.c : null,
    msgServer: input.msgServer?.t === 'auth' ? input.msgServer.c : null,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd?.t === 'auth' ? input.msgCmd : null
  })

  const routing = Routing.update({
    model: input.model.routing,
    msg: input.msg?.t === 'routing' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'routing' ? input.msgCmd : null
  })

  const wire = WireClient.update({
    ctx: clientCtx,
    model: input.model.wire,
    msg: input.msg?.t === 'wire' ? input.msg.c : null,
    msgServer: input.msgServer?.t === 'wire' ? input.msgServer.c : null,
    msgCmd: input.msgCmd?.t === 'wire' ? input.msgCmd : null,
    transport: input.ctx.transport
  })

  const sound = Sound.update({
    model: input.model.sound,
    msg: input.msg?.t === 'sound' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'sound' ? input.msgCmd : null,
    ctx: clientCtx
  })

  const platform = Platform.update({
    model: input.model.platform,
    msg: input.msg?.t === 'platform' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'platform' ? input.msgCmd : null
  })

  const statusBar = StatusBar.update({
    model: input.model.statusBar,
    msg: input.msg?.t === 'status-bar' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'status-bar' ? input.msgCmd : null
  })

  const toast = Toast.update({
    model: input.model.toast,
    msg: input.msg?.t === 'toast' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'toast' ? input.msgCmd : null,
    ctx: clientCtx
  })

  const lang = LangClient.update({
    model: input.model.lang,
    msg: input.msg?.t === 'lang' ? input.msg.c : null,
    msgCmd: null,
    msgServer: input.msgServer?.t === 'lang' ? input.msgServer.c : null,
    msgEvt: input.msgEvt,
    ctx: clientCtx
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
      lang: lang.model
    },

    eff: Eff.batch<MsgClient>([
      Eff.tag('auth', auth.eff),
      Eff.tag('platform', platform.eff),
      Eff.tag('profile', profile.eff),
      Eff.tag('routing', routing.eff),
      Eff.tag('sound', sound.eff),
      Eff.tag('spaces', space.eff),
      Eff.tag('toast', toast.eff),
      Eff.tag('wire', wire.eff),
      Eff.tag('lang', lang.eff)
    ]),

    msgEvt: Msg.batch<ClientEvt>(
      auth.msgEvt,
      profile.msgEvt,
      routing.msgEvt,
      sound.msgEvt,
      space.msgEvt,
      toast.msgEvt,
      wire.msgEvt,
      lang.msgEvt
    ),

    msgCmd: Msg.batch<AppClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>>(
      AppClientCmd.tag('auth', auth.msgCmd),
      AppClientCmd.tag('profile', profile.msgCmd),
      AppClientCmd.tag('spaces', space.msgCmd),
      AppClientCmd.tag('lang', lang.msgCmd),

      statusBar.msgCmd,
      routing.msgCmd,
      sound.msgCmd,
      toast.msgCmd
    )
  }
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

export const subscriptions = (input: { ctx: ClientCtx; model: ModelClient }): Sub<MsgClient> => {
  const ctx = toClientCtx(input)

  return Sub.batch<MsgClient>([
    Sub.tag('→', Sub.flat(input.ctx.transport.fromServer)),
    Sub.tag('platform', Platform.subscriptions),
    Sub.tag('routing', Routing.subscriptions),
    Sub.tag('wire', WireClient.subscriptions({ transport: input.ctx.transport })),
    Sub.tag('lang', LangClient.subscriptions({ ctx, model: input.model.lang })),
    Sub.tag('toast', Toast.subscriptions({ ctx, model: input.model.toast })),
    Sub.tag('auth', AuthClient.subscriptions({ ctx, model: input.model.auth })),
    Sub.tag('spaces', SpacesClient.subscriptions({ ctx, model: input.model.spaces }))
  ])
}

//
//
//
// View
//
//
//

export const View = (input: { ctx: ClientCtx; model: ModelClient; dispatch: (msg: MsgClient) => void }) => {
  const clientCtx = toClientCtx(input)

  return (
    <div
      className='fixed left-1/2 top-1/2 flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-black text-white'
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      <div className='relative flex h-full max-h-[915px] w-full max-w-[520px] flex-col items-center justify-center overflow-hidden rounded min-[520px]:border'>
        <ViewStatusBar model={input.model} dispatch={input.dispatch} ctx={input.ctx} />

        <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
          <ViewRoute model={input.model} dispatch={input.dispatch} ctx={clientCtx} />
        </div>

        <AuthClient.ViewModals
          ctx={clientCtx}
          dispatch={(c) => input.dispatch({ t: 'auth', c })}
          model={input.model.auth}
        />

        <Portal.Exit portalId='modals' />

        <Toast.View ctx={clientCtx} model={input.model.toast} dispatch={(c) => input.dispatch({ t: 'toast', c })} />
      </div>
    </div>
  )
}

const ViewRoute = (input: {
  ctx: AppClientCtx | AnonymousClientCtx
  model: ModelClient
  dispatch: (m: MsgClient) => void
}) => {
  switch (input.model.routing.currentRoute.n) {
    case 'lang': {
      return (
        <LangClient.View
          ctx={input.ctx}
          dispatch={(c) =>
            input.dispatch({
              t: 'lang',
              c
            })
          }
          model={input.model.lang}
        />
      )
    }

    default: {
      switch (input.model.auth.currentUser.t) {
        case 'loading': {
          return <LoadingState />
        }

        case 'logged-in': {
          return <ViewRouteLoggedIn model={input.model} dispatch={input.dispatch} ctx={input.ctx} />
        }

        case 'logged-out': {
          return <ViewRouteLoggedOut model={input.model} dispatch={input.dispatch} ctx={input.ctx} />
        }
      }
    }
  }
}

const ViewRouteLoggedOut: typeof ViewRoute = (input) => {
  switch (input.ctx.currentRoute.n) {
    case 'auth-login': {
      return (
        <AuthClient.View
          model={input.model.auth}
          ctx={input.ctx}
          dispatch={(c) =>
            input.dispatch({
              t: 'auth',
              c
            })
          }
        />
      )
    }
    case 'spaces':
    case 'profile':
    case 'lang': {
      return (
        <ViewRedirect
          dispatch={input.dispatch}
          route={{
            n: 'auth-login',
            t: 'login'
          }}
        />
      )
    }
  }
}

const ViewRouteLoggedIn: typeof ViewRoute = (input) => {
  switch (input.ctx.currentRoute.n) {
    case 'profile': {
      return (
        <ProfileClient.View
          dispatch={(m) =>
            input.dispatch({
              t: 'profile',
              c: m
            })
          }
          model={input.model.profile}
          ctx={input.ctx}
          slots={{
            bottomBar: () => <ViewBottomNavBar model={input.model} dispatch={input.dispatch} ctx={input.ctx} />
          }}
        />
      )
    }

    case 'spaces': {
      return (
        <SpacesClient.View
          dispatch={(m) =>
            input.dispatch({
              t: 'spaces',
              c: m
            })
          }
          model={input.model.spaces}
          ctx={input.ctx}
          slots={{
            bottomBar: () => <ViewBottomNavBar model={input.model} dispatch={input.dispatch} ctx={input.ctx} />
          }}
        />
      )
    }

    case 'lang':
    case 'auth-login': {
      return (
        <ViewRedirect
          dispatch={input.dispatch}
          route={{
            n: 'spaces',
            t: 'space-list'
          }}
        />
      )
    }
  }
}

const ViewRedirect = (input: { route: Route; dispatch: (m: MsgClient) => void }) => {
  return (
    <IntersectionObserverEmitter
      id='redirect'
      onVisible={() =>
        input.dispatch({
          t: 'routing',
          c: {
            t: 'clicked-link',
            route: input.route
          }
        })
      }
    />
  )
}

const ViewStatusBar: typeof View = (input) => {
  const clientCtx = toClientCtx({
    model: input.model,
    ctx: input.ctx
  })

  return (
    <StatusBar.View
      model={input.model.statusBar}
      dispatch={(c) =>
        input.dispatch({
          t: 'status-bar',
          c
        })
      }
      slots={{
        barLeft: (
          <>
            <WireClient.ViewStatusBar ctx={clientCtx} model={input.model.wire} />
          </>
        ),

        barRight: (
          <>
            <Sound.ViewStatusBar model={input.model.sound} />
          </>
        ),

        drawerContent: (
          <>
            <WireClient.ViewStatusBarDrawer
              model={input.model.wire}
              dispatch={(c) =>
                input.dispatch({
                  t: 'wire',
                  c
                })
              }
              ctx={clientCtx}
            />

            <LangClient.ViewStatusBarDrawer
              ctx={clientCtx}
              dispatch={(c) =>
                input.dispatch({
                  t: 'lang',
                  c
                })
              }
              model={input.model.lang}
            />

            <Sound.ViewStatusBarDrawer
              ctx={clientCtx}
              model={input.model.sound}
              dispatch={(c) =>
                input.dispatch({
                  t: 'sound',
                  c
                })
              }
            />
          </>
        )
      }}
    />
  )
}

const ViewBottomNavBar = (input: {
  ctx: AppClientCtx | BaseClientCtx
  model: ModelClient
  dispatch: (m: MsgClient) => void
}) => {
  const { currentUserId } = input.ctx

  if (!currentUserId) {
    return null
  }

  const routeSpace: Route = {
    n: 'spaces',
    t: 'space-list'
  }

  const routeProfile: Route = {
    n: 'profile',
    t: 'profile',
    userId: currentUserId
  }
  return (
    <div className='flex w-full shrink-0 flex-col items-center justify-center'>
      {isAppClientCtx(input.ctx) && (
        <SpacesClient.ViewCurrentSpaceBar
          ctx={input.ctx}
          model={input.model.spaces}
          dispatch={(c) => input.dispatch({ t: 'spaces', c })}
        />
      )}

      <BottomButtons.View
        ctx={input.ctx}
        id='app-bottom-nav'
        onToggle={() => {}}
        open={false}
        buttons={[
          {
            label: input.ctx.t('spaces.spaces'),
            icon: (input) => <IconGamepad {...input} />,
            color: eq(input.model.routing.currentRoute, routeSpace) ? 'selected' : 'inherit',
            onClick() {
              input.dispatch({
                t: 'routing',
                c: {
                  t: 'clicked-link',
                  route: routeSpace
                }
              })
            }
          },
          {
            label: input.ctx.t('profile.profile'),
            icon: (input) => <IconUserCircle {...input} />,
            color: eq(input.model.routing.currentRoute, routeProfile) ? 'selected' : 'inherit',
            onClick() {
              input.dispatch({
                t: 'routing',
                c: {
                  t: 'clicked-link',
                  route: routeProfile
                }
              })
            }
          }
        ]}
      />
    </div>
  )
}
