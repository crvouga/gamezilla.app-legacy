import { ITopicClient } from '~/@/topic/topic-client/interface'
import { TopicContract } from '~/@/topic/topic-contract'
import { AppFrontendModule } from '../@/frontend/app-frontend-module'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { BackendConnectionTypes } from './backend-connection'
import { BackendInstanceTypes } from './backend-instance'

export type ModelFrontend = BackendInstanceTypes.ModelFrontend & BackendConnectionTypes.ModelFrontend

export type MsgFrontend = BackendInstanceTypes.MsgFrontend | BackendConnectionTypes.MsgFrontend

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
