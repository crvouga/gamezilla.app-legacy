import { s } from '~/@/schema'
import { UserId } from '~/app/@/data/user-id'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { NumberlinkBackendCtx } from './@/backend/ctx'
import { HintCalculatorTypes } from './@/solutions/hint-calculator'
import { BuildTypes } from './screen-build'
import { PlayTypes } from './screen-play'

export type ModelFrontend = {
  hintCalculator: HintCalculatorTypes.ModelFrontend
  screenBuild: BuildTypes.ModelFrontend
  screenPlay: PlayTypes.ModelFrontend
}

export const ModelBackend = s.obj({ t: s.l('noop') })
export type ModelBackend = s.Infer<typeof ModelBackend>

export type MsgFrontend =
  | GameMainMenu.Msg
  | { t: 'got-msg-space'; c: MsgSpace }
  | { t: 'got-screen-build-msg'; c: BuildTypes.MsgFrontend }
  | { t: 'got-screen-play-msg'; c: PlayTypes.MsgFrontend }
  | { t: 'got-hint-calculator-msg'; c: HintCalculatorTypes.MsgFrontend }

const MODE = ['build', 'play'] as const
export const Mode = s.enumeration(MODE)
export type Mode = s.Infer<typeof Mode>

export const MsgSpace = s.or(
  s.obj({
    t: s.l('user-changed-mode'),
    mode: s.or(Mode, s.l('none')),
    userId: UserId,
  }),
  s.obj({
    t: s.l('got-screen-play-msg'),
    c: PlayTypes.MsgSpace,
  }),
  s.obj({
    t: s.l('got-screen-build-msg'),
    c: BuildTypes.MsgSpace,
  }),
)
export type MsgSpace = s.Infer<typeof MsgSpace>

export const ModelSpace = s.obj({
  mode: s.or(Mode, s.l('none')),
  screenPlay: PlayTypes.ModelSpace,
  screenBuild: BuildTypes.ModelSpace,
})
export type ModelSpace = s.Infer<typeof ModelSpace>

export type FrontendCtxModule = SpaceFrontendCtx

export type BackendCtxModule = NumberlinkBackendCtx

export type FrontendModule = GameFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
  Ctx: SpaceFrontendCtx
}>
