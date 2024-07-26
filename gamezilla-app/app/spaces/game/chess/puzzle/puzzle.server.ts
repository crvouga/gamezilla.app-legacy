import {
	type Eff,
	Err,
	Ok,
	Result,
	Sub,
	Time,
	andThen,
	eq,
	pipe,
} from 'gamezilla-app/@/core';
import {TimeSpan} from 'gamezilla-app/@/core/time-span';
import type {UserId} from 'gamezilla-app/app/@/data';
import type {IDbConnSql} from 'gamezilla-app/app/@/server/db-conn-sql';
import type {
	SpaceReqCtx,
	SpaceServerCtx,
	SpaceServerEvent,
} from 'gamezilla-app/app/spaces/@/space';
import type {SpaceServerCmd} from 'gamezilla-app/app/spaces/@/space-server-cmd';
import type {ChessMsgCore} from '../@/chess/chess-shared';
import {EloRating} from './elo-rating';
import {PuzzleDb} from './puzzle-db';
import {
	type ModelServer,
	type MsgServer,
	type MsgToClient,
	type MsgToServer,
	type PuzzleInteraction,
	initCore,
	transitionLoadingToStarted,
} from './puzzle.types';

//
//
//
// Model
//
//
//

export const init = ({
	ctx,
}: {
	ctx: SpaceServerCtx;
}): {
	model: ModelServer;
	eff: Eff<MsgServer>;
} => {
	return {
		model: {
			...initCore,
			requests: {},
		},
		eff: async (dispatch) => {
			const result =
				await initialLoad(
					{
						dbConn: ctx.dbConnSql,
						userId: ctx
							.space
							.hostId,
					},
				);
			dispatch({
				t: 'db-got-initial-load',
				result,
			});
		},
	};
};

const initialLoad = async ({
	dbConn,
	userId,
}: {
	dbConn: IDbConnSql;
	userId: UserId;
}) => {
	const found = await PuzzleDb.profiles.findElseInsert(dbConn, {
		userId,
		eloRating: EloRating.initialRating,
		puzzleQuery: {
			ratingRange: [1200, 1500],
		},
	});

	if (found.t === 'err') {
		return found;
	}

	const profile = found.value;

	if (!profile) {
		return Err(
			'Initial load failed. No profile found.',
		);
	}

	const foundPuzzles = await PuzzleDb.puzzles.findForProfile(
		dbConn,
		{
			profile,
		},
	);

	if (foundPuzzles.t === 'err') {
		return foundPuzzles;
	}

	const puzzles = foundPuzzles.value;

	return Ok({profile, puzzles});
};

//
//
//
// Update
//
//
//

export const update = (input: {
	msg: MsgServer;
	model: ModelServer;
	ctx: SpaceServerCtx;
}): {
	model: ModelServer;
	eff?: Eff<MsgServer>;
	msgCmd?: SpaceServerCmd<MsgToClient>[];
} => {
	return pipe(
		updateMain(input),
		andThen((model) =>
			watchPutInteraction({
				ctx: input.ctx,
				modelPrev: input.model,
				model,
			}),
		),
	);
};
const updateMain: typeof update = ({msg, model, ctx}) => {
	switch (msg.t) {
		case 'clock-tick': {
			return {
				model,
				msgCmd: [
					{
						t: 'send-to-space',
						msg: {
							t: 'clock-tick',
							now: ctx.now,
						},
					},
				],
			};
		}

		case 'db-got-puzzles': {
			if (msg.result.t === 'err') {
				return {
					model: {
						...model,
						requests: {
							...model.requests,
							getPuzzles: msg.result,
						},
					},
					msgCmd: [
						{
							t: 'send-to-space',
							msg: {
								t: 'db-got-puzzles',
								result: msg.result,
							},
						},
					],
				};
			}

			const modelNew =
				transitionLoadingToStarted(
					{
						ctx,
						model: {
							...model,
							queue: msg
								.result
								.value,
						},
					},
				);

			return {
				model: {
					...modelNew,
					requests: {
						...model.requests,
						getPuzzles: Ok(
							null,
						),
					},
				},
				msgCmd: [
					{
						t: 'send-to-space',
						msg: {
							t: 'db-got-puzzles',
							result: Ok(
								modelNew,
							),
						},
					},
				],
			};
		}

		case 'db-got-initial-load': {
			if (msg.result.t === 'err') {
				return {
					model,
					msgCmd: [
						{
							t: 'send-to-space',
							msg: {
								t: 'db-got-initial-load',
								result: msg.result,
							},
						},
					],
				};
			}

			const {profile, puzzles} =
				msg.result
					.value;

			const puzzle = puzzles[0];

			if (!puzzle) {
				return {
					model,
					msgCmd: [
						{
							t: 'send-to-space',
							msg: {
								t: 'db-got-initial-load',
								result: Err(
									'No puzzles found.',
								),
							},
						},
					],
				};
			}

			const modelNew: ModelServer = {
				...model,
				t: 'started',
				moves: [],
				profile,
				puzzle,
				queue: puzzles.slice(
					1,
				),
				startedAt: ctx.now,
			};

			return {
				model: modelNew,
				msgCmd: [
					{
						t: 'send-to-space',
						msg: {
							t: 'db-got-initial-load',
							result: Ok(
								modelNew,
							),
						},
					},
				],
			};
		}

		case 'db-put-interaction': {
			return {
				model,
				msgCmd: [
					{
						t: 'send-to-space',
						msg: {
							t: 'db-put-interaction',
							result: Result.mapOk(
								msg.result,
								() =>
									model,
							),
						},
					},
				],
			};
		}

		case 'db-put-profile': {
			return {
				model,
				msgCmd: [
					{
						t: 'send-to-space',
						msg: {
							t: 'db-put-profile',
							result: Result.mapOk(
								msg.result,
								() =>
									model,
							),
						},
					},
				],
			};
		}

		case 'db-got-profile': {
			return {
				model,
			};
		}
	}
};

export const updateFromClient = (input: {
	ctx: SpaceReqCtx;
	msg: MsgToServer;
	model: ModelServer;
}): {
	model: ModelServer;
	eff?: Eff<MsgServer>;
	msgCmd?: SpaceServerCmd<MsgToClient>[];
} => {
	return pipe(
		input,
		andThen((model) =>
			updateFromClientMain({
				...input,
				model,
			}),
		),
		// andThen((model) =>
		//   watchPutInteraction({ ...input, modelPrev: input.model, model })
		// ),
		// andThen((model) =>
		//   watchPutProfile({ ...input, modelPrev: input.model, model })
		// ),
		// andThen((model) =>
		//   watchGetPuzzles({ ...input, modelPrev: input.model, model })
		// )
	);
};

const watchPutInteraction = ({
	modelPrev,
	model,
	ctx,
}: {
	modelPrev: ModelServer;
	model: ModelServer;
	ctx: SpaceServerCtx;
}): {
	model: ModelServer;
	eff?: Eff<MsgServer>;
} => {
	if (model.t === modelPrev.t) {
		return {model};
	}

	if (
		model.t === 'started' ||
		model.t === 'solved' ||
		model.t === 'incorrect' ||
		model.t === 'solved-with-hint'
	) {
		const interaction: PuzzleInteraction = {
			puzzleId: model.puzzle.puzzleId,
			userId: ctx.space.hostId,
			type: model.t,
		};
		return {
			model,
			eff: async (dispatch) => {
				const result =
					await PuzzleDb.interactions.insert(
						ctx.dbConnSql,
						[
							interaction,
						],
					);
				dispatch({
					t: 'db-put-interaction',
					result,
				});
			},
		};
	}

	return {model};
};

export const watchGetPuzzles = ({
	model,
	ctx,
}: {
	model: ModelServer;
	modelPrev: ModelServer;
	ctx: SpaceServerCtx;
}): {
	model: ModelServer;
	eff?: Eff<MsgServer>;
} => {
	if (
		model.t !== 'loading' &&
		model.requests.getPuzzles?.t !== 'loading' &&
		model.queue.length === 0
	) {
		return {
			model: {
				...model,
				requests: {
					...model.requests,
					getPuzzles: {
						t: 'loading',
					},
				},
			},
			eff: async (dispatch) => {
				const result =
					await PuzzleDb.puzzles.findForProfile(
						ctx.dbConnSql,
						{
							profile: model.profile,
							omit: [
								model
									.puzzle
									.puzzleId,
								...model.queue.map(
									(
										x,
									) =>
										x.puzzleId,
								),
							],
						},
					);
				dispatch({
					t: 'db-got-puzzles',
					result,
				});
			},
		};
	}

	return {model};
};

export const watchPutProfile = ({
	model,
	modelPrev,
	ctx,
}: {
	model: ModelServer;
	modelPrev: ModelServer;
	ctx: SpaceServerCtx;
}): {
	model: ModelServer;
	eff?: Eff<MsgServer>;
} => {
	if (model.profile && !eq(model.profile, modelPrev.profile)) {
		const profile = model.profile;
		return {
			model,
			eff: async (dispatch) => {
				const result =
					await PuzzleDb.profiles.update(
						ctx.dbConnSql,
						profile,
					);
				dispatch({
					t: 'db-put-profile',
					result,
				});
			},
		};
	}
	return {model};
};

const updateFromClientMain: typeof updateFromClient = ({model}) => {
	// const handled = updateCore({ ctx, msg, model });

	// return {
	//   model: handled.t === "ok" ? { ...model, ...handled.value } : model,
	//   msgCmd: [{ t: "send-to-space", msg: { ...msg, result: handled } }],
	// };
	return {model};
};

export const updateFromGame = ({
	model,
}: {
	msg: ChessMsgCore;
	model: ModelServer;
}): {
	model: ModelServer;
	eff?: Eff;
} => {
	return {model};
};

export const updateFromEvent = ({
	model,
}: {
	msg: SpaceServerEvent;
	model: ModelServer;
}): {
	model: ModelServer;
	eff?: Eff;
} => {
	return {model};
};

//
//
// Subscriptions
//
//
//

const TICK_RATE = TimeSpan.milliseconds(500);

export const subscriptions = (
	intervalId: string,
	model: ModelServer,
): Sub<MsgServer> => {
	switch (model.t) {
		case 'started': {
			return Time.interval(
				intervalId,
				TICK_RATE,
				() => ({
					t: 'clock-tick',
				}),
			);
		}
		default: {
			return Sub.None;
		}
	}
};
