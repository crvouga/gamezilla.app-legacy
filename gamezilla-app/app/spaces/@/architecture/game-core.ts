export type GameCoreTypes = {
	Ctx: any;
	ModelCore: any;
	MsgCore: any;
	EventCore?: any;
};

export type GameCoreModule<T extends GameCoreTypes> = {
	initCore: (input: {ctx: T['Ctx']}) => T['ModelCore'];
	updateCore: (input: {
		ctx: T['Ctx'];
		msgCore: T['MsgCore'];
		modelCore: T['ModelCore'];
	}) => T['ModelCore'] & {
		event?: T['EventCore'];
	};
};
