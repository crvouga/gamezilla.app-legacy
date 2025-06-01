import { s } from '~/@/schema'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceFrontendCtx } from '../../@/frontend/ctx'
import { GameFrontendModule } from './@/architecture/game-frontend-v2'
import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four.types'
import { FlowBackendCtx } from './flow/@/backend/ctx'
import * as Flow from './flow/types'

export type ModelFrontend = { t: 'connect-four'; c: ConnectFour.ModelFrontend } | { t: 'flow'; c: Flow.ModelFrontend }

export type MsgFrontend = { t: 'connect-four'; c: ConnectFour.MsgFrontend } | { t: 'flow'; c: Flow.MsgFrontend }

export const GAME_NAME_LIST: GameName[] = [
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

export type FrontendModule = GameFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
  Ctx: SpaceFrontendCtx
}>

export type GameBackendCtxModule = SpaceBackendCtx & FlowBackendCtx
