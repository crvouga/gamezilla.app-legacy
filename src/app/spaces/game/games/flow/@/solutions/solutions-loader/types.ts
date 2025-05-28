import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import type { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import { FlowBackendCtx } from '../../backend/ctx'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { Solutions } from '../solutions'
import { p } from '~/@/parser'

export type ModelFrontend = {}

export const initFrontend: ModelFrontend = {}

export type ModelBackend = null

export const MsgFrontend = p.obj({
  t: p.l('got-solutions-db-solutions'),
  solutions: Solutions,
})

export type MsgFrontend = p.Infer<typeof MsgFrontend>

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: FlowFrontendCtxBase
}>

export type BackendModule = AppBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
}>
