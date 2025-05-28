import { p } from '~/@/schema'
import { RemoteResult, Result } from '~/@/result'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { FlowBackendCtx } from '../../backend/ctx'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { Variant } from '../../variant'
import { SolutionHash } from '../solution-hash/solution-hash'
import { Solutions } from '../solutions'

export type FindSolutionRequest = {
  hash: SolutionHash
  result: RemoteResult<string, { solutions: Solutions }>
}

export type ModelFrontend = {
  open: 'find-solutions-confirmation' | null
  requests: {
    [hash: SolutionHash]: FindSolutionRequest
  }
}

export const initFrontend: ModelFrontend = {
  open: null,
  requests: {},
}

export const FoundSolutionResult = Result.parser(p.str, p.obj({ solutions: Solutions }))
export type FoundSolutionResult = p.Infer<typeof FoundSolutionResult>

export const MsgFrontend = p.or(
  p.obj({ t: p.l('clicked-find-solutions'), flow: Variant.Model }),
  p.obj({ t: p.l('found-solution'), flow: Variant.Model, found: FoundSolutionResult }),
  p.obj({ t: p.l('dialog.clicked-open') }),
  p.obj({ t: p.l('dialog.clicked-close') }),
)
export type MsgFrontend = p.Infer<typeof MsgFrontend>

export const MsgBackend = p.obj({ t: p.l('noop') })
export type MsgBackend = p.Infer<typeof MsgBackend>

export const MsgToBackend = p.obj({ t: p.l('noop') })
export type MsgToBackend = p.Infer<typeof MsgToBackend>

export const MsgToFrontend = p.obj({ t: p.l('noop') })
export type MsgToFrontend = p.Infer<typeof MsgToFrontend>

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: FlowFrontendCtxBase & {
    flow?: Variant.Model | null
  }

  ViewSlot: {}
  ViewEmit: {}
}>

export type BackendModule = AppBackendModule<{
  Msg: MsgBackend
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: FlowBackendCtx
}>
