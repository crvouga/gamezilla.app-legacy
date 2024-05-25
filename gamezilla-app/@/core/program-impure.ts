import type { Eff } from "./eff";
import type { Sub } from "./sub";

//
//
//
//
//
//

type MaybePromise<T> = T | Promise<T>;

export type ProgramImpure<TMsg, TCtx> = {
	ctx: () => MaybePromise<TCtx>;
	init: (input: { ctx: TCtx }) => MaybePromise<{ eff?: Eff<TMsg> }>;
	update: (input: { ctx: TCtx; msg: TMsg }) => MaybePromise<{
		eff?: Eff<TMsg>;
	}>;
	subscriptions: (input: {
		intervalId: string;
		ctx: TCtx;
	}) => MaybePromise<Sub<TMsg>>;
	crash?: (input: { error: unknown }) => void;
};

function generateProgramId() {
	return `program:${Math.random().toString(36).slice(2)}`;
}

//
//
//
//
//
//
//
//

export async function run<TMsg, TCtx>(program: ProgramImpure<TMsg, TCtx> & {}) {
	//
	//
	//
	//
	//
	//

	function updateEff(eff?: Eff<TMsg> | null) {
		if (eff) {
			Promise.resolve().then(function runEffect() {
				eff(dispatch);
			});
		}
	}

	const intervalId = generateProgramId();
	let cleanUpSubscriptions = () => {};
	async function updateSubscriptions(ctx: TCtx) {
		const sub = await program.subscriptions({
			intervalId,
			ctx,
		});
		cleanUpSubscriptions();
		cleanUpSubscriptions = sub.sub(dispatch);
	}

	async function dispatch(msg: TMsg) {
		try {
			const ctx = await program.ctx();

			const updated = await program.update({
				ctx,
				msg,
			});

			updateEff(updated.eff);
			updateSubscriptions(ctx);
		} catch (error) {
			program.crash?.({ error });
		}
	}

	const ctx = await program.ctx();

	const init = await program.init({ ctx });

	updateEff(init.eff);
	updateSubscriptions(ctx);
}

export const ProgramImpure = {
	run,
};
