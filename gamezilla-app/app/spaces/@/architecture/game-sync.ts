export type GameSyncTypes = {
	Ctx: any;
	ModelSync: any;
	MsgSync: any;
};

export type GameSyncModule<T extends GameSyncTypes> = {
	initSync: (input: { ctx: T["Ctx"] }) => T["ModelSync"];
	reducer: (input: {
		ctx: T["Ctx"];
		msgSync: T["MsgSync"];
		modelSync: T["ModelSync"];
	}) => T["ModelSync"];
};
