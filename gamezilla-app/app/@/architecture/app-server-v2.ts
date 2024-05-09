import { Eff, batchMsgs, type Sub } from "gamezilla-app/@/core";

//
//
//
//
//

export type AppServerModuleTypes = {
	/**
	 * `Ctx` is data passed down from parent modules
	 */
	Ctx?: any;
	/**
	 * `Msg` is a message that is local to the module. Should almost always be past tense like an msgEvt
	 */
	Msg?: any;
	/**
	 * `MsgToClient` is a message to send to the client component of the module
	 */
	MsgToClient?: any;
	/**
	 * `MsgToServer` is a message to send to the client component of the module
	 */
	MsgToServer?: any;
	/**
	 * `MsgCmdIn` is a message from other modules. Usually verbs
	 */
	MsgCmdIn?: any;
	/**
	 * `MsgEvtIn` is a message to notify other modules. Usually past tense verbs
	 */
	MsgEvtIn?: any;
	/**
	 * `MsgCmdOut` is a message to update some other consuming module. Always present tense verbs. Always Only for one module
	 */
	MsgCmdOut?: any;
	/**
	 * `MsgEvtOut` is a message that is only produced by this module. Always past tense verbs
	 */
	MsgEvtOut?: any;
};

//
//
// Input
//
//

type InputMsg<T extends AppServerModuleTypes> =
	| ({ v: "msg" } & T["Msg"])
	| ({ v: "msg-client" } & T["MsgToServer"])
	| ({ v: "msg-evt" } & T["MsgEvtIn"])
	| ({ v: "msg-cmd" } & T["MsgCmdIn"]);

export type Input<T extends AppServerModuleTypes> = {
	/**
	 * `ctx` is data passed down from parent modules
	 */
	ctx: T["Ctx"];
	/**
	 * `msg` is the message that is being processed
	 */
	msg: InputMsg<T>;
};

type OutputMsg<T extends AppServerModuleTypes> =
	| ({ v: "msg" } & T["Msg"])
	| ({ v: "msg-cmd" } & T["MsgCmdOut"])
	| ({ v: "msg-evt" } & T["MsgEvtOut"]);

export type Output<T extends AppServerModuleTypes> = {
	/**
	 * `eff` is a side effect to be performed. May dispatch a message
	 */
	eff?: Eff<T["Msg"]>;
	/**
	 *
	 */
	msg?: OutputMsg<T>[];
};

/**
 * `AppServerModule` represents a server side app module
 */
export type AppServerModule<T extends AppServerModuleTypes> = {
	/**
	 * `init` is the initial state of the module
	 */
	init: (input: { ctx: T["Ctx"] }) => Promise<Output<T>>;

	/**
	 * `update` handles all the state transitions and business logic of the module
	 */
	update: (input: Input<T>) => Promise<Output<T>>;

	/**
	 * `subscriptions` is dispatches msgs specific to the module
	 */
	subscriptions: (input: {
		ctx: T["Ctx"];
	}) => Promise<Sub<T["Msg"]>>;
};

type MaybePromise<T> = T | Promise<T>;

const andThen = async <T extends AppServerModuleTypes>(
	accPromise: MaybePromise<Output<T>>,
	...updates: (() => MaybePromise<Output<T>>)[]
): Promise<Output<T>> => {
	const [update, ...rest] = updates;

	const acc = await accPromise;

	if (!update) {
		return acc;
	}

	const updated = await update();

	const accNew: Output<T> = {
		eff: Eff.batch([acc.eff, updated.eff]),
		msg: batchMsgs(acc.msg, updated.msg),
	};

	return andThen(accNew, ...rest);
};

export const AppServerModule = {
	andThen,
};
