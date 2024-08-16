import { Browser, Eff, Posix, Sub, batchMsgs, eq } from 'gamezilla-app/@/core'
import { Msg } from 'gamezilla-app/@/core/msg'
import { LanguageCodeISO_639_1, type TranslatedText } from 'gamezilla-app/@/l18n'
import type { Route } from 'gamezilla-app/@/routing/generated/routes'
import type { VDom } from 'gamezilla-app/@/vdom'
import {
  APP_SOUND,
  ClientCmd,
  isAnonymous,
  preloadSound,
  type AnonymousClientCtx,
  type ClientCtx,
  type ClientEvt
} from 'gamezilla-app/app/@/client'
import { IconGamepad, IconUserCircle, LoadingState, Portal, cn } from 'gamezilla-app/app/@/ui'
import type { ServerImpl } from 'gamezilla-app/config'
import { Translator } from './@/client/translator'
import { IntersectionObserverEmitter } from './@/ui/intersection-observer'
import { Platform, Routing, Sound, StatusBar, Toast } from './app-client'
import type { ModelClient, MsgClient, MsgToClient, MsgToServer } from './app.types'
import * as AuthClient from './auth/auth.client'
import * as LangClient from './lang/lang.client'
import * as ProfileClient from './profile/profile.client'
import * as SpaceClient from './spaces/spaces.client'
import { ClientTransport, type IClientTransport } from './wire/transport-client'
import * as WireClient from './wire/wire.client'

//
//
//
// Transport
//
//
//

export type Deps = {
  transport: IClientTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
  stored: Record<string, unknown>
}

export const getDeps = async ({
  serverUrl,
  codebaseVersionId,
  serverImpl
}: {
  serverImpl: ServerImpl
  serverUrl: string
  codebaseVersionId: string
}): Promise<Deps> => {
  const transport = await ClientTransport<MsgToServer, MsgToClient>({
    impl:
      serverImpl === 'node'
        ? {
            t: 'socket-io',
            serverUrl
          }
        : {
            t: 'web-sockets',
            serverUrl
          },
    codebaseVersionId
  })

  const stored = {}

  return {
    transport,
    stored
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

export type Ctx = {
  now: Posix
  location: Browser.Location
  navigatorLanguage: LanguageCodeISO_639_1
}

export const ctx = (): Ctx => {
  return {
    now: Posix.now(),
    location: Browser.location(),
    navigatorLanguage: LanguageCodeISO_639_1.getLangFromNavigator() ?? 'en'
  }
}

export const init = (input: {
  deps: Deps
  ctx: Ctx
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

  const lang = LangClient.init({ ctx, stored: input.deps.stored })
  const toast = Toast.init({ stored: input.deps.stored, ctx })
  const wire = WireClient.init({ stored: input.deps.stored })
  const auth = AuthClient.init({ stored: input.deps.stored, ctx })
  const space = SpaceClient.init({ ctx, stored: input.deps.stored })
  const profile = ProfileClient.init({ ctx, stored: input.deps.stored })
  const sound = Sound.init({ ctx, stored: input.deps.stored })
  const platform = Platform.init({ stored: input.deps.stored })
  const statusBar = StatusBar.init({ stored: input.deps.stored })

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

  const initialCmd = batchMsgs<
    ClientCmd<{
      MsgToServer: MsgToServer
      MsgClient: MsgClient
    }>
  >(
    ClientCmd.tag('spaces', space.msgCmd),
    ClientCmd.tag('profile', profile.msgCmd),
    ClientCmd.tag('auth', auth.msgCmd),
    ClientCmd.tag('lang', lang.msgCmd),
    preloadSound(Object.values(APP_SOUND))
  )

  const updated = updateLoop(input.deps, input.ctx, {
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

const toClientCtx = (input: { model: ModelClient; ctx: Ctx }): ClientCtx | AnonymousClientCtx => {
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
  ctx: Ctx
  msg: MsgClient
  model: ModelClient
  deps: Deps
}): {
  model: ModelClient
  eff?: Eff<MsgClient>
} => {
  const msgServer = input.msg.t === '→' ? input.msg.c : undefined
  const updatedFromMsg = updateChild({
    ctx: input.ctx,
    model: input.model,
    msg: input.msg,
    msgServer: msgServer,
    deps: input.deps
  })

  const updated = updateLoop(input.deps, input.ctx, updatedFromMsg)

  return updated
}

type Output = {
  model: ModelClient
  eff: Eff<MsgClient>
  msgEvt: ClientEvt[]
  msgCmd: ClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>[]
}

const updateLoop = (deps: Deps, ctx: Ctx, acc: Output): Output => {
  const [msgCmd, ...msgCmdRest] = acc.msgCmd

  if (msgCmd) {
    const updatedCmd = updateChild({
      deps,
      ctx,
      model: acc.model,
      msgCmd
    })
    return updateLoop(deps, ctx, {
      model: updatedCmd.model,
      msgCmd: Msg.batch(msgCmdRest, updatedCmd.msgCmd),
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
      msgEvt: Msg.batch(acc.msgEvt, updatedCmd.msgEvt)
    })
  }

  const [msgEvt, ...msgEvtRest] = acc.msgEvt

  if (msgEvt) {
    const updatedEvt = updateChild({
      deps,
      ctx,
      model: acc.model,
      msgEvt
    })
    return updateLoop(deps, ctx, {
      model: updatedEvt.model,
      msgCmd: Msg.batch(msgCmdRest, updatedEvt.msgCmd),
      eff: Eff.batch([acc.eff, updatedEvt.eff]),
      msgEvt: Msg.batch(msgEvtRest, updatedEvt.msgEvt)
    })
  }

  return acc
}

const updateChild = (input: {
  deps: Deps
  ctx: Ctx
  model: ModelClient
  msg?: MsgClient
  msgServer?: MsgToClient
  msgEvt?: ClientEvt
  msgCmd?: ClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
}): Output => {
  const clientCtx = toClientCtx(input)

  const space = SpaceClient.update({
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
    transport: input.deps.transport
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
      Eff.tag('status-bar', statusBar.eff),
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

    msgCmd: Msg.batch<
      ClientCmd<{
        MsgToServer: MsgToServer
        MsgClient: MsgClient
      }>
    >(
      ClientCmd.tag('auth', auth.msgCmd),
      ClientCmd.tag('profile', profile.msgCmd),
      ClientCmd.tag('spaces', space.msgCmd),
      ClientCmd.tag('lang', lang.msgCmd),
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

export const subscriptions = (input: { ctx: Ctx; deps: Deps; model: ModelClient }) => {
  const ctx = toClientCtx(input)

  return Sub.batch<MsgClient>([
    Sub.tag('→', Sub.flat(input.deps.transport.toClient)),
    Sub.tag('wire', WireClient.subscriptions({ transport: input.deps.transport })),
    Sub.tag('platform', Platform.subscriptions),
    Sub.tag('routing', Routing.subscriptions),
    Sub.tag('lang', LangClient.subscriptions({ ctx, model: input.model.lang })),
    Sub.tag('toast', Toast.subscriptions({ ctx, model: input.model.toast })),
    Sub.tag('auth', AuthClient.subscriptions({ ctx, model: input.model.auth })),
    Sub.tag('spaces', SpaceClient.subscriptions({ ctx, model: input.model.spaces }))
  ])
}

//
//
//
// View
//
//
//

export const View = (input: { ctx: Ctx; model: ModelClient; dispatch: (msg: MsgClient) => void }) => {
  const clientCtx = toClientCtx(input)

  return (
    <div
      className='fixed left-1/2 top-1/2 flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-black text-white'
      style={{
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className='relative flex h-full max-h-[915px] w-full max-w-[520px] flex-col items-center justify-center overflow-hidden rounded border border-neutral-600'>
        <ViewStatusBar model={input.model} dispatch={input.dispatch} ctx={input.ctx} />

        <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
          <ViewRoute model={input.model} dispatch={input.dispatch} ctx={clientCtx} />
        </div>

        <AuthClient.ViewModals
          ctx={clientCtx}
          dispatch={(c) =>
            input.dispatch({
              t: 'auth',
              c
            })
          }
          model={input.model.auth}
        />

        <Portal.Exit portalId='modals' />

        <Toast.View
          ctx={clientCtx}
          model={input.model.toast}
          dispatch={(c) =>
            input.dispatch({
              t: 'toast',
              c
            })
          }
        />
      </div>
    </div>
  )
}

const ViewRoute = (input: {
  ctx: ClientCtx | AnonymousClientCtx
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
        <SpaceClient.View
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
  ctx: ClientCtx | AnonymousClientCtx
  model: ModelClient
  dispatch: (m: MsgClient) => void
}) => {
  if (isAnonymous(input.ctx)) {
    return null
  }
  const items: {
    route: Route
    label: TranslatedText
    icon: VDom
  }[] = [
    {
      route: {
        n: 'spaces',
        t: 'space-list'
      },
      label: input.ctx.t('spaces.spaces'),
      icon: <IconGamepad className='h-7 w-7' />
    },
    {
      route: {
        n: 'profile',
        t: 'profile',
        userId: input.ctx.currentUserId
      },
      label: input.ctx.t('profile.profile'),
      icon: <IconUserCircle className='h-7 w-7' />
    }
  ]

  return (
    <div className='flex w-full shrink-0 flex-col items-center justify-center'>
      <SpaceClient.ViewCurrentSpaceBar
        ctx={input.ctx}
        model={input.model.spaces}
        dispatch={(c) =>
          input.dispatch({
            t: 'spaces',
            c
          })
        }
      />
      <div className='flex h-16 w-full items-center justify-center border-t border-neutral-600'>
        {items.map((item) => {
          const isSelected = eq(item.route, input.model.routing.currentRoute)
          return (
            <button
              type='button'
              key={item.route.n}
              onClick={() =>
                input.dispatch({
                  t: 'routing',
                  c: {
                    t: 'clicked-link',
                    route: item.route
                  }
                })
              }
              className={cn(
                'flex flex-1 flex-col items-center justify-center pb-2 pt-1',
                isSelected ? 'text-blue-500' : 'text-opacity-50'
              )}
            >
              {item.icon}
              <div className='mt-0.5 text-xs text-inherit'>{item.label}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
