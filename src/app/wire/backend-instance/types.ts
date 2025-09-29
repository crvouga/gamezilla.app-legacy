import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { IBackendInstanceDb } from '~/app/@/backend/backend-instance/backend-instance-db'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { AppFrontendCtx, AppFrontendCtxBase } from '~/app/@/frontend/ctx'

export type ModelFrontend = {}

export type MsgFrontend = { t: 'backendInstance_noop' }

export type FrontendCtx = AppFrontendCtxBase | AppFrontendCtx

export type BackendCtxModule = AppBackendCtxBase & {
  backendInstanceDb: IBackendInstanceDb
}

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtx
  Model: ModelFrontend
  Msg: MsgFrontend
}>
