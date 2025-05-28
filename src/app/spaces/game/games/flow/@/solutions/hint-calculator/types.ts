import { s } from '~/@/schema'
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

export const FoundSolutionResult = Result.parser(s.str, s.obj({ solutions: Solutions }))
export type FoundSolutionResult = s.Infer<typeof FoundSolutionResult>

export const MsgFrontend = s.or(
  s.obj({ t: s.l('clicked-find-solutions'), flow: Variant.Model }),
  s.obj({ t: s.l('found-solution'), flow: Variant.Model, found: FoundSolutionResult }),
  s.obj({ t: s.l('dialog.clicked-open') }),
  s.obj({ t: s.l('dialog.clicked-close') }),
)
export type MsgFrontend = s.Infer<typeof MsgFrontend>

export const MsgBackend = s.obj({ t: s.l('noop') })
export type MsgBackend = s.Infer<typeof MsgBackend>

export const MsgToBackend = s.obj({ t: s.l('noop') })
export type MsgToBackend = s.Infer<typeof MsgToBackend>

export const MsgToFrontend = s.obj({ t: s.l('noop') })
export type MsgToFrontend = s.Infer<typeof MsgToFrontend>

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
