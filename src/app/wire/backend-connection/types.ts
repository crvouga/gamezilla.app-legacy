import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { s } from '~/@/schema'
import { UnixMs } from '~/@/time/unix-ms'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { TopicContract } from '~/@/topic/topic-contract'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { PingId } from './ping-id'

export type PingItem = {
  pingId: PingId
  pingAt: UnixMs
  pongAt: UnixMs | null
}

export type Model = {
  backendConnection_pings?: CappedOrderedDict<PingId, PingItem>
}

export const INITIAL_PINGS: CappedOrderedDict<PingId, PingItem> = CappedOrderedDict.init({ maxSize: 5 })

export type ModelFrontend = Model

export const PingPongMsg = s.obj({
  pingId: PingId.schema,
})
export type PingPongMsg = s.Infer<typeof PingPongMsg>

export type MsgFrontend =
  | { n: 'backendConnection'; t: 'backendConnection_ping'; pingId: PingId; now: UnixMs }
  | { n: 'backendConnection'; t: 'backendConnection_pong'; pingId: PingId; now: UnixMs }

export const topicContract = TopicContract.init({
  backendConnection_ping: {
    params: ClientSessionId,
    msg: PingPongMsg,
  },
  backendConnection_pong: {
    params: ClientSessionId,
    msg: PingPongMsg,
  },
})

export type FrontendCtxModule = AppFrontendCtxBase & {
  topic: ITopicClient<typeof topicContract>
}

export type BackendCtxModule = AppBackendCtxBase & {
  topic: ITopicClient<typeof topicContract>
}

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtxModule
  Model: ModelFrontend
  Msg: MsgFrontend
}>
