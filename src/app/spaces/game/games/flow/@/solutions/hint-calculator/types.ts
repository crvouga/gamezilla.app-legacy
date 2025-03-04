import { RemoteResult, Result } from '~/@/result'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import { SpaceFrontendCmd } from '~/app/spaces/@/frontend/cmd'
import { SpaceFrontendEvt } from '~/app/spaces/@/frontend/evt'
import { FlowBackendCtx } from '../../backend/ctx'
import { FlowFrontendCmdRoot } from '../../frontend/cmd-root'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { FlowFrontendEvtIn } from '../../frontend/evt'
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

export type FoundSolutionResult = Result<string, { solutions: Solutions }>

export type MsgFrontend =
  | { t: 'clicked-find-solutions'; flow: Variant.Model }
  | { t: 'found-solution'; flow: Variant.Model; found: FoundSolutionResult }
  | { t: 'dialog.clicked-open' }
  | { t: 'dialog.clicked-close' }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type MsgInCmdFrontend = {
  t: 'flow-cmd.got-hint-calculator-cmd'
  c: {
    t: 'got-msg'
    msg: MsgFrontend
  }
}

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: FlowFrontendCtxBase & {
    flow?: Variant.Model | null
  }
  MsgEvtIn: FlowFrontendEvtIn
  MsgCmdOut: FlowFrontendCmdRoot | SpaceFrontendCmd<{ MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }>
  MsgCmdIn: MsgInCmdFrontend
  MsgEvtOut: SpaceFrontendEvt
  ViewSlot: {}
  ViewEmit: {}
}>

export type BackendModule = AppBackendModule<{
  Msg: MsgBackend
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
}>
