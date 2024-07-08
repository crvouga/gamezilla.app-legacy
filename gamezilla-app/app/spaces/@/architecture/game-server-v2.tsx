import { Eff, type Sub } from "gamezilla-app/@/core";
import type { ClientId, SessionId, UserId } from "gamezilla-app/app/@/data";
import type { EventId, WithEventId } from "../event";
import { Msg } from "gamezilla-app/@/core/msg";

//
//
//
//
//

export type GameServerModuleTypes = {
	/**
	 * `Ctx` is data passed down from parent modules
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	Ctx?: any;
	/**
	 * `Model` is the state of the module
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	Model?: any;
	/**
	 * `Msg` is a message that is local to the module. Should almost always be past tense like an msgEvt
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	Msg?: any;
	/**
	 * `MsgToClient` is a message to send to the client component of the module
	 */

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	MsgToClient?: any;
	/**
	 * `MsgToServer` is a message to send to the client component of the module
	 */

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	MsgToServer?: any;
	/**
	 * `MsgCmdIn` is a message from other modules. Usually verbs
	 */

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	MsgCmdIn?: any;
	/**
	 * `MsgEvtIn` is a message to notify other modules. Usually past tense verbs
	 */

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	MsgEvtIn?: any;
	/**
	 * `MsgCmdOut` is a message to update some other consuming module. Always present tense verbs. Always Only for one module
	 */

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	MsgCmdOut?: any;
	/**
	 * `MsgEvtOut` is a message that is only produced by this module. Always past tense verbs
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	MsgEvtOut?: any;
	/**
	 *
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	MsgCore?: any;
	/**
	 *
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	ModelCore?: any;
	/**
	 *
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	Deps?: any;
};

//
//
// Input
//
//

export type Input<T extends GameServerModuleTypes> = {
	/**
	 * `ctx` is data passed down from parent modules
	 */
	ctx: T["Ctx"];
	/**
	 * `model` is the current state of the module
	 */
	model: T["Model"];
	/**
	 * `modelCore` is the current state of the game. This is shared between client and server.
	 */
	modelCore: T["ModelCore"];
	/**
	 * `msgCore` is an msgEvt of game
	 */
	msgCore?: (T["MsgCore"] & { eventId: EventId }) | null;
	/**
	 * `msg`
	 */
	msg?: T["Msg"] | null;
	/**
	 * `msgServer`
	 */
	msgClient?:
		| (T["MsgToServer"] & {
				clientId: ClientId;
				sessionId: SessionId;
				userId: UserId;
		  })
		| null;
	/**
	 * `msgEvt`
	 */
	msgEvt?: T["MsgEvtIn"] | null;
	/**
	 * `msgCmd`
	 */
	msgCmd?: T["MsgCmdIn"] | null;
	/**
	 *
	 */
	deps: T["Deps"];
};

//
//
// Output
//
//

export type Output<T extends GameServerModuleTypes> = {
	/**
	 * `model` will be the new state of the module
	 */
	readonly model: T["Model"];
	/**
	 * `eff` is a side effect to be performed. May dispatch a message
	 */
	readonly eff?: Eff<T["Msg"]>;
	/**
	 * `msgCmd` is a message to one other module. Always present tense
	 */
	readonly msgCmd?: T["MsgCmdOut"][];
	/**
	 * `msgEvt` is a message to many other modules. Always past tense
	 */
	readonly msgEvt?: T["MsgEvtOut"][];
	/**
	 *  `msgCore` is an msgEvt that occurred in the game. Shared with the client side
	 */
	readonly msgCore?: WithEventId<T["MsgCore"]>[];
};

/**
 * `GameServerModule` represents a server side app module
 */
export type GameServerModule<T extends GameServerModuleTypes> = {
	/**
	 * `deps` are all of the dependencies you neeed to inject
	 **/
	deps: (input: { ctx: T["Ctx"] }) => Promise<T["Deps"]>;
	/**
	 * `init` is the initial state of the module
	 */
	init: T["Model"];

	/**
	 * `update` handles all the state transitions and business logic of the module
	 */
	update: (input: Input<T>) => Promise<Output<T>>;

	/**
	 * `subscriptions` is dispatchs msgs specific to the module
	 */
	subscriptions: (input: {
		ctx: T["Ctx"];
		modelCore: T["ModelCore"];
		model: T["Model"];
	}) => Promise<Sub<T["Msg"]>>;
};

//
//
//
//
//
//
//
//

const andThen = async <T extends GameServerModuleTypes>(
	acc: Output<T>,
	...updates: ((model: T["Model"]) => Promise<Output<T>>)[]
): Promise<Output<T>> => {
	for (const update of updates) {
		const updated = await update(acc.model);
		acc = {
			model: updated.model,
			eff: Eff.batch([acc.eff, updated.eff]),
			msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
			msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
			msgCore: Msg.batch(acc.msgCore, updated.msgCore),
		};
	}
	return acc;
};

const tagOutput = <
	TTag extends string,
	T extends GameServerModuleTypes,
	TTaggedCmd extends GameServerModuleTypes["MsgCmdOut"],
>(
	tag: TTag,
	tagCmd: (msgCmd: T["MsgCmdOut"][]) => TTaggedCmd[] | null | undefined,
	output: Output<T>,
): {
	model: { t: TTag; c: T["Model"] };

	eff?: Eff<{ t: TTag; c: T["Msg"] }>;
	/**
	 *
	 */
	msgCmd?: TTaggedCmd[];
	/**
	 *
	 */
	msgEvt?: T["MsgEvtOut"][];
	/**
	 *
	 */
	msgCore?: WithEventId<{ t: TTag; c: T["MsgCore"] }>[];
} => {
	return {
		model: {
			t: tag,
			c: output.model,
		},
		msgCmd: output.msgCmd ? tagCmd(output.msgCmd) ?? [] : [],
		eff: Eff.tag(tag, output.eff),
		msgEvt: output.msgEvt,
		msgCore: output.msgCore?.map((c) => ({
			eventId: c.eventId,
			c: c,
			t: tag,
		})),
	};
};

export const GameServerModule = {
	andThen,
	tagOutput,
};
