//
//
//
//

import { p } from "gamezilla-app/@/core/parser";

export const LIST_TABS = ["puzzles", "packs"] as const;

export const ListTab = p.enumeration(LIST_TABS);

export type ListTab = p.Infer<typeof ListTab>;

//
//
//
//

export type MsgClient = { t: "user-changed-list-tab"; listTab: ListTab };

export const MsgCore = p.obj({
	t: p.l("user-changed-list-tab"),
	listTab: ListTab,
});
export type MsgCore = p.Infer<typeof MsgCore>;

export const ModelCore = p.obj({
	listTab: ListTab,
});
export type ModelCore = p.Infer<typeof ModelCore>;
