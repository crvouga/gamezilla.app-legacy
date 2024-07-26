//
//
//
//

import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'

export const LIST_TABS = ['puzzles', 'packs'] as const

export const ListTab = p.enumeration(LIST_TABS)

export type ListTab = p.Infer<typeof ListTab>

//
//
//
//

export type MsgClient = MsgCore

export const MsgCore = p.or(
  p.obj({
    t: p.l('user-changed-list-tab'),
    listTab: ListTab,
    userId: UserId
  }),
  p.obj({
    t: p.l('user-clicked-back-button'),
    userId: UserId
  })
)
export type MsgCore = p.Infer<typeof MsgCore>

export const ModelCore = p.obj({
  listTab: ListTab
})
export type ModelCore = p.Infer<typeof ModelCore>
