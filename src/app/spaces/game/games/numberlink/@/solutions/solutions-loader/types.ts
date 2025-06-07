import { s } from '~/@/schema'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { Solutions } from '../solutions'

export type ModelFrontend = {}

export const initFrontend: ModelFrontend = {}

export const MsgFrontend = s.obj({
  t: s.l('got-solutions-db-solutions'),
  solutions: Solutions,
})

export type MsgFrontend = s.Infer<typeof MsgFrontend>

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: FlowFrontendCtxBase
}>
