//
//
//
//

import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import { GameMainMenu } from '../../../@/game'

export const OPTION = ['puzzles', 'packs'] as const

export const Option = p.enumeration(OPTION)

export type Option = p.Infer<typeof Option>

//
//
//
//

export type MsgClient = GameMainMenu.Msg

export const MsgCore = p.or(
  p.obj({
    t: p.l('screen-main-menu.user-clicked-back-button'),
    userId: UserId
  }),
  p.obj({
    t: p.l('screen-main-menu.user-clicked-option'),
    userId: UserId,
    option: Option
  })
)
export type MsgCore = p.Infer<typeof MsgCore>
