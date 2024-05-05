export type GameCoreTypes = {
	Ctx: any;
	ModelCore: any;
	MsgCore: any;
};

export type GameCoreModule<T extends GameCoreTypes> = {
	initCore: (input: { ctx: T["Ctx"] }) => T["ModelCore"];
	updateCore: (input: {
		ctx: T["Ctx"];
		msgCore: T["MsgCore"];
		modelCore: T["ModelCore"];
	}) => T["ModelCore"];
};
