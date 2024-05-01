//
//
//
//

export const LIST_TABS = ["puzzles", "packs"] as const;

export type ListTab = (typeof LIST_TABS)[number];

//
//
//
//

export type MsgClient = { t: "user-changed-list-tab"; listTab: ListTab };

export type MsgSync = {
	t: "user-changed-list-tab";
	listTab: ListTab;
};

export type ModelSync = {
	listTab: ListTab;
};
