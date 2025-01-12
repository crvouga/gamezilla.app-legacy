import { p } from '~/@/parser'
import { SpaceFrontendCmd } from '~/app/spaces/@/space-frontend/cmd'
import { SpaceFrontendCtx } from '~/app/spaces/@/space-frontend/ctx'
import { SpaceFrontendEvt } from '~/app/spaces/@/space-frontend/evt'
import { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/space-backend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
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

export const ModelCore = p.or(
  p.obj({
    t: p.l('connect-four'),
    c: ConnectFour.ModelCore,
  }),
  p.obj({
    t: p.l('flow'),
    c: Flow.ModelCore,
  }),
)
export type ModelCore = p.Infer<typeof ModelCore>

export const MsgCore = p.or(
  p.obj({
    t: p.l('connect-four'),
    c: ConnectFour.MsgCore,
  }),
  p.obj({
    t: p.l('flow'),
    c: Flow.MsgCore,
  }),
)
export type MsgCore = p.Infer<typeof MsgCore>

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
  ModelCore: ModelCore
  MsgCore: MsgCore
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
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: GameBackendCtx
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
  Deps: null
}>
