import { RemoteResult, Result } from '~/@/result'
import { s } from '~/@/schema'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { NumberlinkVariant } from '../../variant'
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

export const FoundSolutionResult = Result.schema(s.str(), s.obj({ solutions: Solutions }))
export type FoundSolutionResult = s.Infer<typeof FoundSolutionResult>

export const MsgFrontend = s.or(
  s.obj({ t: s.l('clicked-find-solutions'), numberlink: NumberlinkVariant.Model }),
  s.obj({ t: s.l('found-solution'), numberlink: NumberlinkVariant.Model, found: FoundSolutionResult }),
  s.obj({ t: s.l('dialog.clicked-open') }),
  s.obj({ t: s.l('dialog.clicked-close') }),
)
export type MsgFrontend = s.Infer<typeof MsgFrontend>

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  Ctx: FlowFrontendCtxBase & {
    flow?: NumberlinkVariant.Model | null
  }
  ViewSlot: {}
  ViewEmit: {}
}>
