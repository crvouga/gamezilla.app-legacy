//
//
//
//

import { z } from "zod"

export const LIST_TABS = ["puzzles", "packs"] as const

export type ListTab = (typeof LIST_TABS)[number]

//
//
//
//

export type MsgClient = { t: "user-changed-list-tab"; listTab: ListTab }

export const ListTab = z.enum(["puzzles", "packs"])

export const MsgSync = z.object({
  t: z.literal("user-changed-list-tab"),
  listTab: ListTab,
})

export type MsgSync = {
  t: "user-changed-list-tab"
  listTab: ListTab
}

export type ModelSync = {
  listTab: ListTab
}

export const initSync: ModelSync = {
  listTab: "puzzles",
}
