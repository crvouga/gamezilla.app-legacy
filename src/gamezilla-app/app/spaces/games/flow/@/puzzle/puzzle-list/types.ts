import { NotAsked, type RequestResponse } from '@/core'
import type { AppClientModule } from 'gamezilla-app/app/@/architecture/app-client'
import type { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import type { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import { SpaceClientEvt } from 'gamezilla-app/app/spaces/@/space-client-evt'
import type { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { FlowClientEvtIn } from '../../flow-client-evt'
import { FlowServerCtx } from '../../flow-server-ctx'
import type { FlowPuzzle } from '../puzzle'
import type { ListPuzzlesInput, ListPuzzlesOutput } from '../puzzle-db'
import type { FlowPuzzleId } from '../puzzle-id'
import { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space-client-ctx'
import { SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space-server-evt'

//
//
//
//
//

export type ClientModule = AppClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: SpaceClientCtx
  MsgEvtIn: FlowClientEvtIn
  MsgCmdOut: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgCmdIn: MsgInCmdClient
  MsgEvtOut: SpaceClientEvt
  ViewSlot: {
    fab: null
  }
  ViewEmit: {
    clickedPuzzleItem: FlowPuzzle
  }
}>

export type ServerModule = AppServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: FlowServerCtx
  MsgEvtIn: SpaceServerEvt
}>

//
//
//
//

export type ModelClient = {
  request: RequestResponse<string, null>
  puzzles: { [id: FlowPuzzleId]: FlowPuzzle }
}

export const initClient: ModelClient = {
  request: NotAsked,
  puzzles: {}
}

export type ModelServer = null

export type MsgClient = { t: 'flow-puzzle-list.user-observed-end-of-list' } | { t: 'flow-puzzle-list.time-passed' }

export type MsgServer = { t: 'flow-puzzle-list.noop' }

export type MsgToServer = {
  t: 'flow-puzzle-list.list-puzzles'
  input: ListPuzzlesInput
}

export type MsgToClient = {
  t: 'flow-puzzle-list.listed-puzzle'
  listed: ListPuzzlesOutput
}

export type MsgInCmdClient = {
  t: 'flow-puzzle-list'
  c: {
    t: 'load'
  }
}
