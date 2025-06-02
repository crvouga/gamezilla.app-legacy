import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { s } from '~/@/schema'
import { Posix } from '~/@/time/posix'
import { Topic } from '~/@/topic'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { PingId } from './ping-id'

export type PingItem = {
  pingId: PingId
  pingAt: Posix
  pongAt: Posix | null
}

export type Model = {
  pings: CappedOrderedDict<PingId, PingItem>
}

export const initModel = (): Model => {
  return {
    pings: CappedOrderedDict.init({ maxSize: 5 }),
  }
}

export type ModelFrontend = Model

export const PingPongMsg = s.obj({
  pingId: PingId.schema,
})
export type PingPongMsg = s.Infer<typeof PingPongMsg>

export type MsgFrontend = { t: 'ping'; pingId: PingId; now: Posix } | { t: 'pong'; pingId: PingId; now: Posix }

export const topicContract = Topic.initContract({
  'wire.ping': {
    params: s.l(null),
    msg: PingPongMsg,
  },
  'wire.pong': {
    params: ClientSessionId,
    msg: PingPongMsg,
  },
})

export type FrontendCtxModule = AppFrontendCtxBase & {
  topic: Topic.Client<typeof topicContract>
}

export type BackendCtxModule = AppBackendCtxBase & {
  topic: Topic.Client<typeof topicContract>
}

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtxModule
  Model: ModelFrontend
  Msg: MsgFrontend
}>

export type BackendModule = AppBackendModule<{
  Ctx: BackendCtxModule
}>
