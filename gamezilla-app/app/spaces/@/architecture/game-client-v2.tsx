import { Eff, type Sub } from "gamezilla-app/@/core";
import type { VDom } from "gamezilla-app/@/vdom";
import type { WithEventId, WithEventMeta } from "../event";

//
//
//
//
//

export type GameClientModuleTypes = {
	/**
	 * `Ctx` is data passed down from parent modules
	 */
	Ctx?: any;
	/**
	 * `Model` is the state of the module
	 */
	Model?: any;
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
	 * `MsgCmdOut` is a message to update some other consuming module. Always present tense verbs. Always Only for one module
	 */
	MsgCmdOut?: any;
	/**
	 * `MsgEvtIn` is a message to notify other modules. Usually past tense verbs
	 */
	MsgEvtIn?: any;
	/**
	 * `MsgEvtOut` is a message that is only produced by this module. Always past tense verbs
	 */
	MsgEvtOut?: any;
	/**
	 *
	 */
	MsgCore?: any;
	/**
	 *
	 */
	ModelCore?: any;
	/**
	 *  `ViewSlot` is a slot that the module can fill with a view
	 */
	ViewSlot?: SlotInputTypes;
	/**
	 * `ViewEmits` is a slot that the module can fill with a view
	 */
	ViewEmit?: EmitInputTypes;
};

// Define a more flexible structure for slots and emits
type SlotInputTypes = {
	[key: string]: any;
};

type EmitInputTypes = {
	[key: string]: any;
};
type SlotRenderFunctions<Slots> = Slots extends SlotInputTypes
	? { [K in keyof Slots]: (input: Slots[K]) => VDom }
	: {};

type EmitFunctions<Emits> = Emits extends EmitInputTypes
	? { [K in keyof Emits]: (input: Emits[K]) => void }
	: {};

//
//
// Input
//
//

export type Input<T extends GameClientModuleTypes> = {
	/**
	 * `ctx` is data passed down from parent modules
	 */
	ctx: T["Ctx"];
	/**
	 * `model` is the current state of the module
	 */
	model: T["Model"];
	/**
	 * `location`
	 */
	// location: T["Location"];
	/**
	 * `msg`
	 */
	msg?: T["Msg"] | null;
	/**
	 * `msgServer` is a message from the server
	 */
	msgServer?: T["MsgToClient"] | null;
	/**
	 * `msgEvt`
	 */
	msgEvt?: T["MsgEvtIn"] | null;
	/**
	 * `msgCmd`
	 */
	msgCmd?: T["MsgCmdIn"] | null;

	/**
	 * `modelCore` is the current state of the game. This is shared and auto synced between client and server.
	 */
	modelCore: T["ModelCore"];
	/**
	 * `msgCore` is an msgEvt of game
	 */
	msgCore?: WithEventMeta<T["MsgCore"]> | null;
};

//
//
// Output
//
//

export type Output<T extends GameClientModuleTypes> = {
	/**
	 * `model` will be the new state of the module
	 */
	model: T["Model"];
	/**
	 * `eff` is a side effect to be performed. May dispatch a message
	 */
	eff?: Eff<T["Msg"]>;
	/**
	 * `msgCmd` is a message to one other module. Always present tense
	 */
	msgCmd?: T["MsgCmdOut"][];
	/**
	 * `msgEvt` is a message to many other modules. Always past tense
	 */
	msgEvt?: T["MsgEvtOut"][];
	/**
	 *  `msgCore` are events that occurred in the game. Shared with the server side
	 */
	msgCore?: WithEventId<T["MsgCore"]>[];
};

/**
 * `GameClientModule` represents a client side app module
 */
export type GameClientModule<T extends GameClientModuleTypes> = {
	/**
	 * `init` is the initial state of the module
	 */
	init: T["Model"];

	/**
	 * `update` handles all the state transitions and business logic of the module
	 */
	update: (input: Input<T>) => Output<T>;

	/**
	 * `subscriptions` is dispatchs msgs specific to the module
	 */
	subscriptions: (input: {
		ctx: T["Ctx"];
		modelCore: T["ModelCore"];
		model: T["Model"];
	}) => Sub<T["Msg"]>;

	/**
	 * `View` is for rendering the UI for the module
	 */
	View: (input: {
		ctx: T["Ctx"];
		modelCore: T["ModelCore"];
		model: T["Model"];
		dispatch: (msg: T["Msg"]) => void;
		slots?: SlotRenderFunctions<T["ViewSlot"]>;
		emits?: EmitFunctions<T["ViewEmit"]>;
	}) => VDom;

	/**
	 *
	 */
	ViewFeedItem: (input: {
		ctx: T["Ctx"];
		msgCore: T["MsgCore"];
		modelCore: T["ModelCore"];
		dispatch: (msg: T["Msg"]) => void;
	}) => VDom;
};

//
//
//
//
//
//
//
//

export const andThen = <T extends GameClientModuleTypes>(
	acc: Output<T>,
	...updates: ((model: T["Model"]) => Output<T>)[]
): Output<T> => {
	const [update, ...rest] = updates;

	if (!update) {
		return acc;
	}

	const updated = update(acc.model);

	if (!updated) {
		return acc;
	}

	const accNew: Output<T> = {
		model: updated.model,
		eff: Eff.batch([acc.eff, updated.eff]),
		msgCmd: [...(acc.msgCmd ?? []), ...(updated.msgCmd ?? [])],
		msgEvt: [...(acc.msgEvt ?? []), ...(updated.msgEvt ?? [])],
		msgCore: [...(acc.msgCore ?? []), ...(updated.msgCore ?? [])],
	};

	return andThen(accNew, ...rest);
};

const tagOutput = <
	TTag extends string,
	T extends GameClientModuleTypes,
	TTaggedCmd extends GameClientModuleTypes["MsgCmdOut"],
>(
	tag: TTag,
	tagCmd: (msgCmd: T["MsgCmdOut"][]) => TTaggedCmd[],
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
		msgCmd: output.msgCmd ? tagCmd(output.msgCmd) : [],
		eff: Eff.tag(tag, output.eff),
		msgEvt: output.msgEvt,
		msgCore: output.msgCore?.map((c) => {
			const child = { ...c };
			child.eventId = undefined;
			return {
				eventId: c.eventId,
				c: child,
				t: tag,
			};
		}),
	};
};

export const GameClientModule = {
	andThen,
	tagOutput,
};
