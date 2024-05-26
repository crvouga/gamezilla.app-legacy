import { RequestResponse, Result, isErr } from "gamezilla-app/@/core";
import { AppClientModule } from "gamezilla-app/app/@/architecture/app-client";
import { sendToServer, showErrSm } from "gamezilla-app/app/@/client";
import { IntersectionObserverEmitter } from "gamezilla-app/app/@/ui/intersection-observer";
import type {
	SpaceClientCtx,
	SpaceClientEvent,
} from "gamezilla-app/app/spaces/@/space";
import type { SpaceClientCmd } from "gamezilla-app/app/spaces/@/space-client-cmd";
import type { FlowPack } from "..";
import {
	initClient,
	type ModelClient,
	type MsgClient,
	type MsgToClient,
	type MsgToServer,
} from "./flow-pack-grid.types";

export type FlowPackGridClientCtx = SpaceClientCtx & {
	pack: FlowPack;
};

type ClientModule = AppClientModule<{
	Ctx: FlowPackGridClientCtx;
	Model: ModelClient;
	Msg: MsgClient;
	MsgEvtIn: SpaceClientEvent;
	MsgCmdOut: SpaceClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: MsgToServer;
	}>;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	ViewSlot: {
		grid: {
			request: RequestResponse<string, null>;
		};
	};
}>;

const updateFetchMissingPuzzles = (input: {
	ctx: FlowPackGridClientCtx;
	model: ModelClient;
}) => {
	if (!input.ctx.pack) {
		return { model: input.model };
	}

	if (RequestResponse.isRequesting(input.model.request)) {
		return { model: input.model };
	}

	const isMissingPuzzles = input.ctx.pack.puzzleIds.some(
		(puzzleId) => !input.model?.puzzles[puzzleId],
	);

	if (!isMissingPuzzles) {
		return { model: input.model };
	}

	return {
		model: {
			...input.model,
			request: RequestResponse.requesting(input.ctx.now),
		},
		msgCmd: [
			sendToServer({
				t: "list-puzzles-by-id",
				puzzleIds: input.ctx.pack.puzzleIds,
			}),
		],
	};
};

const updateServerListedPuzzles: ClientModule["update"] = (input) => {
	const { model, msgServer } = input;
	switch (msgServer?.t) {
		case "listed-puzzles-by-id": {
			return AppClientModule.andThen(
				{ model },
				//
				(model) => {
					if (isErr(msgServer.listed)) {
						return {
							model,
							msgCmd: showErrSm(msgServer.listed.error),
						};
					}

					const puzzlesNew = msgServer.listed.value.items.reduce(
						(acc, puzzle) => {
							acc[puzzle.id] = puzzle;
							return acc;
						},
						model.puzzles,
					);

					return {
						model: {
							...input.model,
							puzzles: puzzlesNew,
						},
					};
				},
				(model) => {
					return {
						model: {
							...model,
							request: RequestResponse.response(
								model.request,
								input.ctx.now,
								Result.mapOk(msgServer.listed, () => null),
							),
						},
					};
				},
			);
		}
	}
	return { model: input.model };
};



const updateRequest: ClientModule["update"] = (input) => {
	return {
		model: {
			...input.model,
			request: RequestResponse.elapsed(input.model.request, input.ctx.now),
		},
	};
}

const subscriptionsRequest: ClientModule["subscriptions"] = (input) => {
	return RequestResponse.subscriptions(input.model.request, () => ({ t: "elapsed" }));
}

const update: ClientModule["update"] = (input) => {
	return AppClientModule.andThen(
		{ model: input.model },
		(model) => updateServerListedPuzzles({ ...input, model }),
		(model) => updateFetchMissingPuzzles({ ...input, model }),
		(model) => updateRequest({ ...input, model }),
	);
};

const View = (input: { dispatch: (msg: MsgClient) => void }) => {
	return (
		<IntersectionObserverEmitter
			id="flow-pack-grid"
			onVisible={() => input.dispatch({ t: "user-observed-grid" })}
		/>
	);
};

const subscriptions: ClientModule["subscriptions"] = (input) => {
	return subscriptionsRequest(input)
};

export const FlowPackGridClient = {
	initClient,
	update,
	View,
	subscriptions,
};
