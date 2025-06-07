//
//
//
//

import { s } from '~/@/schema'
import { UserId } from '~/app/@/data/user-id'
import { GameMainMenu } from '../../../@/ui/game-main-menu'

export const OPTION = ['puzzle-builder', 'pack-builder'] as const

export const Option = s.enumeration(OPTION)

export type Option = s.Infer<typeof Option>

//
//
//
//

export type MsgFrontend = GameMainMenu.Msg

export const MsgSpace = s.or(
  s.obj({
    t: s.l('screen-main-menu.user-clicked-back-button'),
    userId: UserId,
  }),
  s.obj({
    t: s.l('game.numberlink.build.screen-main-menu.user-clicked-option'),
    userId: UserId,
    option: Option,
  }),
)
export type MsgSpace = s.Infer<typeof MsgSpace>
