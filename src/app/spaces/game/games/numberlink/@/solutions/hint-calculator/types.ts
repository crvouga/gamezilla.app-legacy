import { RemoteResult, Result } from '~/@/result'
import { s } from '~/@/schema'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { NumberlinkVariant } from '../../variant'
import { SolutionHash } from '../solution-hash/solution-hash'
import { Solutions } from '../solutions'

export type FindSolutionRequest = {
  hash: SolutionHash
  result: RemoteResult<string, { solutions: Solutions }>
}

// const Model = s.obj({
//   open: s.or(s.l('find-solutions-confirmation'), s.l('none')),
//   requests: s.obj({
//     [hash: SolutionHash]: FindSolutionRequest,
//   }),
// })

export type ModelFrontend = {
  hintCalculator_open: 'find-solutions-confirmation' | null
  hintCalculator_requests: {
    [hash: SolutionHash]: FindSolutionRequest
  }
}

export const initFrontend: ModelFrontend = {
  hintCalculator_open: null,
  hintCalculator_requests: {},
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
    numberlink?: NumberlinkVariant.Model | null
  }
  ViewSlot: {}
  ViewEmit: {}
}>
