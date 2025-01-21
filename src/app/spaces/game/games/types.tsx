import { p } from '~/@/parser'
import { SpaceFrontendCmd } from '~/app/spaces/@/frontend/cmd'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { SpaceFrontendEvt } from '~/app/spaces/@/frontend/evt'
import { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import { GameFrontendModule } from './@/architecture/game-frontend-v2'
import { GameBackendModule } from './@/architecture/game-backend-v2'
import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four.types'
import { FlowBackendCtx } from './flow/@/backend/ctx'
import * as Flow from './flow/types'

//
//
//
//
//
//
//

export type ModelFrontend = { t: 'connect-four'; c: ConnectFour.ModelFrontend } | { t: 'flow'; c: Flow.ModelFrontend }

export const ModelBackend = p.or(
  p.obj({
    t: p.l('connect-four'),
    c: ConnectFour.ModelBackend,
  }),
  p.obj({
    t: p.l('flow'),
    c: Flow.ModelBackend,
  }),
)
export type ModelBackend = p.Infer<typeof ModelBackend>

//
//
//
//
//
//
//

export type MsgBackend = { t: 'connect-four'; c: ConnectFour.MsgBackend } | { t: 'flow'; c: Flow.MsgBackend }

export type MsgFrontend = { t: 'connect-four'; c: ConnectFour.MsgFrontend } | { t: 'flow'; c: Flow.MsgFrontend }

export type MsgToFrontend = { t: 'connect-four'; c: ConnectFour.MsgToFrontend } | { t: 'flow'; c: Flow.MsgToFrontend }

export type MsgToBackend = { t: 'connect-four'; c: ConnectFour.MsgToBackend } | { t: 'flow'; c: Flow.MsgToBackend }

//
//
//
// Game Name
//
//
//

export const gameNameList: GameName[] = [
  // "connect-four",
  'flow',
]

export const ModelSpace = p.or(
  p.obj({
    t: p.l('connect-four'),
    c: ConnectFour.ModelSpace,
  }),
  p.obj({
    t: p.l('flow'),
    c: Flow.ModelSpace,
  }),
)
export type ModelSpace = p.Infer<typeof ModelSpace>

export const MsgSpace = p.or(
  p.obj({
    t: p.l('connect-four'),
    c: ConnectFour.MsgSpace,
  }),
  p.obj({
    t: p.l('flow'),
    c: Flow.MsgSpace,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>

//
//
//
//
//
//

export type FrontendModule = GameFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
  Ctx: SpaceFrontendCtx
  MsgEvtIn: SpaceFrontendEvt
  MsgCmdOut: SpaceFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>
}>

export type GameBackendCtx = SpaceBackendCtx & {
  flow: FlowBackendCtx
}

export type BackendModule = GameBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
  Ctx: GameBackendCtx
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
  Deps: null
}>
