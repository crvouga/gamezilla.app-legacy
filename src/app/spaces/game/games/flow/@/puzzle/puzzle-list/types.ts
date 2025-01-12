import { RequestResponse } from '~/@/request-response/request-response'
import { NotAsked } from '~/@/result'
import type { AppClientModule } from '~/app/@/architecture/app-client'
import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import { SpaceClientCmd } from '~/app/spaces/@/space-client/cmd'
import { SpaceClientEvt } from '~/app/spaces/@/space-client/evt'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import { FlowClientCmdRoot } from '../../client/cmd-root'
import { FlowClientCtxRoot } from '../../client/ctx-root'
import { FlowClientEvtIn } from '../../client/evt'
import { FlowBackendCtx } from '../../backend/ctx'
import type { Puzzle } from '../puzzle'
import type { ListPuzzlesInput, ListPuzzlesOutput } from '../puzzle-db'

//
//
//
//

export type ModelClient = {
  request: RequestResponse<string, null>
}

export const initClient: ModelClient = {
  request: NotAsked,
}

export type ModelBackend = null

export type MsgClient = { t: 'user-observed-end-of-list' } | { t: 'time-passed' }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = {
  t: 'list-puzzles'
  input: ListPuzzlesInput
}

export type MsgToClient = {
  t: 'listed-puzzle'
  listed: ListPuzzlesOutput
}

export type MsgInCmdClient = {
  t: 'puzzle-list'
  c: {
    t: 'load'
  }
}

//
//
//
//
//

export type ClientModule = AppClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  Ctx: FlowClientCtxRoot
  MsgEvtIn: FlowClientEvtIn
  MsgCmdOut: FlowClientCmdRoot | SpaceClientCmd<{ MsgClient: MsgClient; MsgToBackend: MsgToBackend }>
  MsgCmdIn: MsgInCmdClient
  MsgEvtOut: SpaceClientEvt
  ViewSlot: { fab: null }
  ViewEmit: { clickedPuzzleItem: Puzzle }
}>

export type BackendModule = AppBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgCmdOut: SpaceBackendCmd<MsgToClient>
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
}>
