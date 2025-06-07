import { s } from '~/@/schema'
import { UserId } from '~/app/@/data/user-id'
import type { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import type { FlowFrontendCtx } from '../@/frontend/ctx'
import { NumberlinkSpaceCtx } from '../@/space/ctx'
import { FlowSpaceEvt } from '../@/space/event'
import { ScreenPackBuilderTypes } from './pack-builder/screen-pack-builder'
import { ScreenPackBuilderOpenTypes } from './pack-builder/screen-pack-builder-open'
import { ScreenPuzzleBuilderTypes } from './puzzle-builder/screen-puzzle-builder'
import { ScreenPuzzleBuilderOpenTypes } from './puzzle-builder/screen-puzzle-builder-open'
import { ScreenMainMenu } from './screen-main-menu'

//
//
//
// Model
//
//
//

type BaseModelFrontend = {
  puzzleBuilderOpened?: 'more' | 'edit-name' | 'delete-forever' | 'unsaved-changes' | null
}

export type ModelFrontend = BaseModelFrontend &
  ScreenPuzzleBuilderOpenTypes.ModelFrontend &
  ScreenPuzzleBuilderTypes.ModelFrontend &
  ScreenPackBuilderTypes.ModelFrontend &
  ScreenPackBuilderOpenTypes.ModelFrontend

export const initFrontend: FrontendModule['init'] = {
  ...ScreenPuzzleBuilderOpenTypes.initFrontend,
  ...ScreenPuzzleBuilderTypes.initFrontend,
  ...ScreenPackBuilderTypes.initFrontend,
  ...ScreenPackBuilderOpenTypes.initFrontend,
}

//
//
//
// Msg
//
//
//

export type MsgFrontend =
  | ScreenPuzzleBuilderOpenTypes.MsgFrontend
  | ScreenPuzzleBuilderTypes.MsgFrontend
  | ScreenMainMenu.MsgFrontend
  | ScreenPackBuilderOpenTypes.MsgFrontend
  | { t: 'got-screen-pack-builder-msg'; c: ScreenPackBuilderTypes.MsgFrontend }
  | { t: 'got-msg-space'; c: MsgSpace }
  | { t: 'got-msg-out'; c: unknown }

//
//
//
//
//
//
//

export const MsgSpace = s.or(
  ScreenMainMenu.MsgSpace,
  ScreenPuzzleBuilderTypes.MsgSpace,
  ScreenPuzzleBuilderOpenTypes.MsgSpace,
  ScreenPackBuilderOpenTypes.MsgSpace,
  s.obj({
    t: s.l('got-screen-pack-builder-msg'),
    c: ScreenPackBuilderTypes.MsgSpace,
  }),
  s.obj({
    t: s.l('user-clicked-back-button'),
    userId: UserId,
  }),
)
export type MsgSpace = s.Infer<typeof MsgSpace>

export const Screen = s.or(
  s.obj({
    t: s.l('screen-main-menu'),
  }),
  s.obj({
    t: s.l('screen-puzzle-builder-open'),
  }),
  s.obj({
    t: s.l('screen-pack-builder-open'),
  }),
  s.obj({
    t: s.l('screen-puzzle-builder'),
  }),
  s.obj({
    t: s.l('screen-pack-builder'),
  }),
)
export type Screen = s.Infer<typeof Screen>

export const ModelSpace = s.obj({
  screen: Screen,
  screenPuzzleBuilder: s.maybe(ScreenPuzzleBuilderTypes.ModelSpace),
  screenPuzzleBuilderOpen: s.maybe(ScreenPuzzleBuilderOpenTypes.ModelSpace),
  screenPackBuilder: s.maybe(ScreenPackBuilderTypes.ModelSpace),
  screenPackBuilderOpen: s.maybe(ScreenPackBuilderOpenTypes.ModelSpace),
})

export type ModelSpace = s.Infer<typeof ModelSpace>

export type UpdateSpace = (input: {
  ctx: NumberlinkSpaceCtx
  msgSpace: MsgSpace
  modelSpace: ModelSpace
}) => ModelSpace & { event?: FlowSpaceEvt }

//
//
//
//
//
//
//
//

export type FrontendModule = GameFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
  Ctx: FlowFrontendCtx
}>
