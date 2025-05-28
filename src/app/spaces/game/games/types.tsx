import { s } from '~/@/schema'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceFrontendCtx } from '../../@/frontend/ctx'
import { GameBackendModule } from './@/architecture/game-backend-v2'
import { GameFrontendModule } from './@/architecture/game-frontend-v2'
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

export const ModelBackend = s.or(
  s.obj({
    t: s.l('connect-four'),
    c: ConnectFour.ModelBackend,
  }),
  s.obj({
    t: s.l('flow'),
    c: Flow.ModelBackend,
  }),
)
export type ModelBackend = s.Infer<typeof ModelBackend>

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

export const ModelSpace = s.or(
  s.obj({
    t: s.l('connect-four'),
    c: ConnectFour.ModelSpace,
  }),
  s.obj({
    t: s.l('flow'),
    c: Flow.ModelSpace,
  }),
)
export type ModelSpace = s.Infer<typeof ModelSpace>

export const MsgSpace = s.or(
  s.obj({
    t: s.l('connect-four'),
    c: ConnectFour.MsgSpace,
  }),
  s.obj({
    t: s.l('flow'),
    c: Flow.MsgSpace,
  }),
)
export type MsgSpace = s.Infer<typeof MsgSpace>

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
  Deps: null
}>
