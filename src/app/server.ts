import { Msg } from '~/@/msg/msg'
import { sleep } from '~/@/promise/sleep'
import { RPC } from '~/@/rpc'
import { Runtime } from '~/@/runtime'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { WebServer } from '~/@/web-server'
import { DATABASE_URL } from '~/config-private'
import { IS_PROD, SERVER_IMPL } from '~/config-public'
import { DbConnKv } from '../@/db-conn-kv'
import { DbConnSql } from '../@/db-conn-sql'
import { Logger } from '../@/logger'
import { ILogger } from '../@/logger/interface'
import { PubSubTopicBased } from '../@/pub-sub-topic-based'
import { SMS } from '../@/sms'
import { ProfileCache } from './@/server/profile-cache'
import { ServerCmd } from './@/server/cmd'
import { AppServerCtx } from './@/server/ctx'
import { ServerEvt } from './@/server/evt'
import { ServerInstanceId } from './@/server/server-instance/server-instance-id'
import * as AuthServer from './auth/server'
import * as LangServer from './lang/server'
import * as ProfileServer from './profile/server'
import { SpacesServer } from './spaces/server'
import {
  rpcContract,
  ServerCtx,
  type MsgServer,
  type MsgToClient,
  type MsgToServer,
  type MsgToServerMeta,
} from './types'
import * as WireServer from './wire/server'
import { ServerTransport } from './wire/transport/server'

//
//
//
//
//
//
//

const initCtx = async (): Promise<ServerCtx> => {
  const logger = Logger({ t: 'console' })

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const simulateLatency = IS_PROD ? async () => {} : async () => sleep(TimeSpan.milliseconds(100 + Math.random() * 100))

  const dbConnSql = await DbConnSql({
    t: 'postgres',
    databaseUrl: DATABASE_URL,
    logger,
    simulateLatency,
  })

  const dbConnKv = await DbConnKv({
    t: 'postgres',
    dbConnSql,
    logger,
  })

  const sms = SMS({
    t: 'twilio',
    logger,
  })

  const webServer = WebServer({
    logger,
    t: SERVER_IMPL,
  })

  const pubSub = await PubSubTopicBased({ t: 'noop' })

  const transport = await ServerTransport<MsgToServer, MsgToClient>(
    webServer.t === 'bun'
      ? {
          t: 'bun-web-sockets',
          dbConnSql,
          webServer,
          logger,
          pubSubTopicBased: pubSub,
          isProd: IS_PROD,
        }
      : {
          t: 'noop',
          logger,
        },
  )

  const profileCache = await ProfileCache({
    t: 'cached-db-conn-kv',
    dbConnKv,
    logger,
    runtime,
  })

  const env = IS_PROD ? 'prod' : 'dev'

  const ctx: AppServerCtx = {
    env,
    sms,
    dbConnSql,
    dbConnKv,
    logger,
    now: Posix.now(),
    sleep,
    pubSub,
    profileCache,
    webServer,
    runtime,
    serverInstanceId: ServerInstanceId.generate(),
  }

  const wire = await WireServer.initCtx({ ctx, transport })
  const profile = await ProfileServer.initCtx({ ctx })
  const space = await SpacesServer.initCtx({ ctx })
  const auth = await AuthServer.initCtx({ ctx })

  return {
    ...ctx,
    webServer: webServer,
    auth,
    space,
    profile,
    wire,
    transport,
  }
}

const updateCtx = (ctx: ServerCtx): ServerCtx => {
  return {
    ...ctx,
    now: Posix.now(),
  }
}

//
//
//
//
//
//
//

const init = async (_input: { ctx: ServerCtx }): Promise<{}> => {
  return {}
}

//
//
//
//
//
//
//

const update = async (input: { msg: MsgServer; ctx: ServerCtx }): Promise<{}> => {
  logMsg({ msg: input.msg, logger: input.ctx.logger })

  const updated = await updateChild({
    ctx: input.ctx,
    msg: input.msg,
    msgClient: input.msg.t === '→' ? { ...input.msg, ...input.msg.c } : null,
  })

  await updateLoop(input.ctx, updated)

  return {}
}

const logMsg = ({
  msg,
  msgEvt,
  msgCmd,
  logger,
}: {
  logger: ILogger
  msg?: MsgServer | null
  msgEvt?: ServerEvt | null
  msgCmd?: ServerCmd<MsgToClient> | null
}) => {
  const prefix = msg ? '[msg]' : msgEvt ? '[evt]' : '[cmd]'

  const obj = { ...msg, ...msgEvt, ...msgCmd }

  const sentMsgType =
    msgCmd?.c.t === 'send-to-client' || msgCmd?.c.t === 'send-to-user' || msgCmd?.c.t === 'broadcast'
      ? Msg.toType(msgCmd.c.msg)
      : null

  const log = [prefix, Msg.toType(obj)]

  if (sentMsgType) {
    log.push(`sent ${sentMsgType}`)
  }

  logger.info(log.join(' '))
}

const updateLoop = async (
  ctx: ServerCtx,
  acc: {
    msgEvt: ServerEvt[]
    msgCmd: ServerCmd<MsgToClient>[]
  },
): Promise<{
  msgEvt: ServerEvt[]
  msgCmd: ServerCmd<MsgToClient>[]
}> => {
  const [msgCmd, ...msgCmdRest] = acc.msgCmd

  if (msgCmd) {
    const updatedCmd = await updateChild({ ctx, msgCmd })

    logMsg({ msgCmd, logger: ctx.logger })

    return updateLoop(ctx, {
      msgCmd: Msg.batch(msgCmdRest, updatedCmd.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updatedCmd.msgEvt),
    })
  }

  const [msgEvt, ...msgEvtRest] = acc.msgEvt

  if (msgEvt) {
    const updatedEvent = await updateChild({ ctx, msgEvt })

    logMsg({ msgEvt, logger: ctx.logger })

    return updateLoop(ctx, {
      msgCmd: Msg.batch(msgCmdRest, updatedEvent.msgCmd),
      msgEvt: Msg.batch(msgEvtRest, updatedEvent.msgEvt),
    })
  }

  return acc
}

const updateChild = async (input: {
  ctx: ServerCtx
  msg?: MsgServer | null
  msgClient?: (MsgToServer & MsgToServerMeta) | null
  msgEvt?: ServerEvt | null
  msgCmd?: ServerCmd<MsgToClient> | null
}): Promise<{
  msgEvt: ServerEvt[]
  msgCmd: ServerCmd<MsgToClient>[]
}> => {
  const userId = await AuthServer.getUserIdFromSessionId(input.ctx.auth, input.msgClient?.sessionId)

  const [space, auth, wire, profile, lang] = await Promise.all([
    SpacesServer.update({
      deps: null,
      ctx: input.ctx.space,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'spaces' ? { ...input.msgClient, ...input.msgClient.c, userId } : null,
      msg: input.msg?.t === 'spaces' ? input.msg.c : null,
    }),

    AuthServer.update({
      deps: null,
      ctx: input.ctx.auth,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'auth' ? { ...input.msgClient, ...input.msgClient.c, userId } : null,
      msg: input.msg?.t === 'auth' ? input.msg.c : null,
    }),

    WireServer.update({
      ctx: input.ctx.wire,
      msgCmd: input.msgCmd?.t === 'wire' ? input.msgCmd : null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'wire' ? { ...input.msgClient, ...input.msgClient.c } : null,
      msg: input.msg?.t === 'wire' ? input.msg.c : null,
    }),

    ProfileServer.update({
      deps: null,
      ctx: input.ctx.profile,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'profile' ? { ...input.msgClient, ...input.msgClient.c } : null,
      msg: input.msg?.t === 'profile' ? input.msg.c : null,
    }),

    LangServer.update({
      deps: null,
      ctx: input.ctx,
      msgCmd: null,
      msgEvt: input.msgEvt,
      msgClient: input.msgClient?.t === 'lang' ? { ...input.msgClient, ...input.msgClient.c } : null,
      msg: input.msg?.t === 'lang' ? input.msg.c : null,
    }),
  ])

  return {
    msgCmd: Msg.batch<ServerCmd<MsgToClient>>(
      ServerCmd.tag('spaces', space.msgCmd),
      ServerCmd.tag('auth', auth.msgCmd),
      ServerCmd.tag('wire', wire.msgCmd),
      ServerCmd.tag('profile', profile.msgCmd),
      ServerCmd.tag('lang', lang.msgCmd),
    ),
    msgEvt: Msg.batch<ServerEvt>(
      //
      auth.msgEvt,
      space.msgEvt,
      wire.msgEvt,
      profile.msgEvt,
      lang.msgEvt,
    ),
  }
}

//
//
//
// Subscriptions
//
//
//

const subscriptions = async (input: { ctx: ServerCtx }): Promise<Sub<MsgServer>> => {
  return Sub.batch([
    Sub.tag('spaces', await SpacesServer.subscriptions({ ctx: input.ctx.space, deps: null })),
    Sub.tag('wire', WireServer.subscriptions({ ctx: input.ctx.wire })),
    Sub.flat(
      Sub.map(input.ctx.transport.fromClient, ({ sessionId, clientId, msgs }) =>
        msgs.map((c): MsgServer => ({ t: '→', sessionId, clientId, c })),
      ),
    ),
  ])
}

const rpc = (input: { ctx: ServerCtx }) => {
  return RPC.initServer(rpcContract, {
    wire: WireServer.rpc({ ctx: input.ctx.wire }),
  })
}

export const AppServer = {
  initCtx,
  updateCtx,
  init,
  update,
  subscriptions,
  rpc,
}
