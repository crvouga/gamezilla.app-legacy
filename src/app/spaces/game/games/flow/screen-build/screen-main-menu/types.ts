//
//
//
//

import { p } from '~/@/schema'
import { UserId } from '~/app/@/data/user-id'
import { GameMainMenu } from '../../../@/ui/game-main-menu'

export const OPTION = ['puzzle-builder', 'pack-builder'] as const

export const Option = p.enumeration(OPTION)

export type Option = p.Infer<typeof Option>

//
//
//
//

export type MsgFrontend = GameMainMenu.Msg

export const MsgSpace = p.or(
  p.obj({
    t: p.l('screen-main-menu.user-clicked-back-button'),
    userId: UserId,
  }),
  p.obj({
    t: p.l('flow.build.screen-main-menu.user-clicked-option'),
    userId: UserId,
    option: Option,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>
