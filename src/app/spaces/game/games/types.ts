import { s } from '~/@/schema'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceFrontendCtx } from '../../@/frontend/ctx'
import { GameFrontendModule } from './@/architecture/game-frontend-v2'
import { GameName } from './@/game-name'
import { ConnectFourTypes } from './connect-four'
import { NumberlinkTypes } from './numberlink'

export type ModelFrontend =
  | { t: 'connect-four'; c: ConnectFourTypes.ModelFrontend }
  | { t: 'numberlink'; c: NumberlinkTypes.ModelFrontend }

export type MsgFrontend =
  | { t: 'connect-four'; c: ConnectFourTypes.MsgFrontend }
  | { t: 'numberlink'; c: NumberlinkTypes.MsgFrontend }

export const GAME_NAME_LIST: GameName[] = ['numberlink']

export const ModelSpace = s.or(
  s.obj({
    t: s.l('connect-four'),
    c: ConnectFourTypes.ModelSpace,
  }),
  s.obj({
    t: s.l('numberlink'),
    c: NumberlinkTypes.ModelSpace,
  }),
)
export type ModelSpace = s.Infer<typeof ModelSpace>

export const MsgSpace = s.or(
  s.obj({
    t: s.l('connect-four'),
    c: ConnectFourTypes.MsgSpace,
  }),
  s.obj({
    t: s.l('numberlink'),
    c: NumberlinkTypes.MsgSpace,
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

export type GameBackendCtxModule = SpaceBackendCtx & NumberlinkTypes.BackendCtxModule
