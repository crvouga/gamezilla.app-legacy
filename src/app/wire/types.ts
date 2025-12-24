import { ITopicClient } from '~/@/topic/topic-client/interface'
import { TopicContract } from '~/@/topic/topic-contract'
import { AppFrontendModule } from '../@/frontend/app-frontend-module'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import * as BackendConnectionTypes from './backend-connection/types'
import * as BackendInstanceTypes from './backend-instance/types'

export type ModelFrontend = {
  backendInstance: BackendInstanceTypes.ModelFrontend
  backendConnection: BackendConnectionTypes.ModelFrontend
}

export type MsgFrontend =
  | { t: 'backendInstance'; c: BackendInstanceTypes.MsgFrontend }
  | { t: 'backendConnection'; c: BackendConnectionTypes.MsgFrontend }

export const topicContract = TopicContract.combine([BackendConnectionTypes.topicContract])

export type FrontendCtxModule = AppFrontendCtxBase & {
  topic: ITopicClient<typeof topicContract>
}

export type BackendCtxModule = AppBackendCtxBase &
  BackendInstanceTypes.BackendCtxModule &
  BackendConnectionTypes.BackendCtxModule

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtxModule
  Model: ModelFrontend
  Msg: MsgFrontend
}>
