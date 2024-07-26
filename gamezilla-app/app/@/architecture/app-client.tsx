import {Eff, type Sub} from 'gamezilla-app/@/core';
import {Msg} from 'gamezilla-app/@/core/msg';
import type {VDom} from 'gamezilla-app/@/vdom';

//
//
//
//
//

export type AppClientModuleTypes = {
	/**
	 * `Ctx` is data passed down from parent modules
	 */
	Ctx?: unknown;
	/**
	 * `Model` is the state of the module that lives in memory
	 */
	Model?: Record<string, unknown>;
	/**
	 * `Msg` is a message that is local to the module. Should always be an event that happens in the module. Like `user-clicked-a-button`
	 */
	Msg?: unknown;
	/**
	 * `MsgToClient` is a message to send to the client component of the module
	 */
	MsgToClient?: unknown;
	/**
	 * `MsgToServer` is a message to send to the client component of the module
	 */
	MsgToServer?: unknown;
	/**
	 * `MsgCmdIn` is a message from other modules. Usually verbs
	 */
	MsgCmdIn?: unknown;
	/**
	 * `MsgEvtIn` is a message to notify other modules. Usually past tense verbs
	 */
	MsgEvtIn?: unknown;
	/**
	 * `MsgCmdOut` is a message to update some other consuming module. Always present tense verbs. Always Only for one module
	 */
	MsgCmdOut?: unknown;
	/**
	 * `MsgEvtOut` is a message that is only produced by this module. Always past tense verbs
	 */
	MsgEvtOut?: unknown;
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
	[key: string]: unknown;
};

type EmitInputTypes = {
	[key: string]: unknown;
};
type SlotRenderFunctions<Slots> = Slots extends SlotInputTypes
	? {[K in keyof Slots]: (input: Slots[K]) => VDom}
	: {};

type EmitFunctions<Emits> = Emits extends EmitInputTypes
	? {[K in keyof Emits]: (input: Emits[K]) => void}
	: {};
//
//
// Input
//
//

export type Input<T extends AppClientModuleTypes> = {
	/**
	 * `ctx` is data passed down from parent modules
	 */
	ctx: T['Ctx'];
	/**
	 * `model` is the current state of the module
	 */
	model: T['Model'];
	/**
	 * `msg` is an event that happens client side within this module. Like `user-clicked-a-button`
	 */
	msg?: T['Msg'] | null;
	/**
	 * `msgServer` is a message from the server
	 */
	msgServer?: T['MsgToClient'] | null;
	/**
	 * `msgEvt` is an event that happen in another module. Like `user-logged-out`, `route-changed`
	 */
	msgEvt?: T['MsgEvtIn'] | null;
	/**
	 * `msgCmd` is a command to sent from another module. Like `show-toast`, `logout`
	 */
	msgCmd?: T['MsgCmdIn'] | null;
};

//
//
// Output
//
//

export type Output<T extends AppClientModuleTypes> = {
	/**
	 * `model` will be the new state of the module
	 */
	model: T['Model'];
	/**
	 * `eff` is a side effect to be performed. May dispatch a message
	 */
	eff?: Eff<T['Msg']>;
	/**
	 * `msgCmd` is a message to send to another module
	 */
	msgCmd?: T['MsgCmdOut'][];
	/**
	 * `msgEvt` is a message to notify other modules
	 */
	msgEvt?: T['MsgEvtOut'][];
};

/**
 * `AppClientModule` represents a client side app module
 */
export type AppClientModule<T extends AppClientModuleTypes> = {
	/**
	 * `init` is the initial state of the module
	 */
	init: (input: {
		ctx: T['Ctx'];
		stored?: Record<string, unknown> | null;
	}) => Output<T>;

	/**
	 * `update` handles all the state transitions and business logic of the module
	 */
	update: (input: Input<T>) => Output<T>;

	/**
	 * `subscriptions` is dispatches msgs specific to the module
	 */
	subscriptions: (input: {
		ctx: T['Ctx'];
		model: T['Model'];
	}) => Sub<T['Msg']>;

	/**
	 * `View` is for rendering the UI for the module
	 */
	View: (input: {
		ctx: T['Ctx'];
		model: T['Model'];
		dispatch: (msg: T['Msg']) => void;
		slots?: SlotRenderFunctions<T['ViewSlot']>;
		emits?: EmitFunctions<T['ViewEmit']>;
	}) => VDom;
};

export const andThen = <T extends AppClientModuleTypes>(
	acc: Output<T>,
	...updates: ((model: T['Model']) => Output<T>)[]
): Output<T> => {
	for (const update of updates) {
		const updated = update(acc.model);
		acc = {
			model: {
				...acc.model,
				...updated.model,
			},
			eff: Eff.batch(
				acc.eff,
				updated.eff,
			),
			msgCmd: Msg.batch(
				acc.msgCmd,
				updated.msgCmd,
			),
			msgEvt: Msg.batch(
				acc.msgEvt,
				updated.msgEvt,
			),
		};
	}
	return acc;
};

export const AppClientModule = {
	andThen,
};
