import { RequestResponse, Result, Sub, isErr } from "gamezilla-app/@/core";
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
} from "./flow-pack-grid.core";

type Ctx = SpaceClientCtx & {
	pack: FlowPack | null;
};

type ClientModule = AppClientModule<{
	Ctx: Ctx;
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

const ObserveGrid: Pick<ClientModule, "View" | "update"> = {
	update(input) {
		switch (input.msg?.t) {
			case "user-observed-grid": {
				if (!input.ctx.pack) {
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
			}
		}

		return { model: input.model };
	},
	View(input) {
		return (
			<IntersectionObserverEmitter
				id="flow-pack-grid"
				onVisible={() => input.dispatch({ t: "user-observed-grid" })}
			/>
		);
	},
};

const ServerListedPuzzles: Pick<ClientModule, "update"> = {
	update(input) {
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
	},
};

const RequestTimeout: Pick<ClientModule, "update" | "subscriptions"> = {
	update(input) {
		const { model } = input;
		return {
			model: {
				...model,
				request: RequestResponse.elapsed(model.request, input.ctx.now),
			},
		};
	},
	subscriptions(input) {
		return RequestResponse.subscriptions(
			input.model.request,
			() => ({ t: "elapsed" }),
			//
		);
	},
};

export const FlowPackGridClient: Pick<
	ClientModule,
	"View" | "update" | "subscriptions" | "init"
> & {
	initClient: ModelClient;
} = {
	initClient,
	init() {
		return {
			model: initClient,
		};
	},
	update(input) {
		return AppClientModule.andThen(
			{ model: input.model },
			(model) => ObserveGrid.update({ ...input, model }),
			(model) => ServerListedPuzzles.update({ ...input, model }),
			(model) => RequestTimeout.update({ ...input, model }),
		);
	},
	View(input) {
		return (
			<>
				{input.slots?.grid({
					request: input.model.request,
				})}
				<ObserveGrid.View {...input} />
			</>
		);
	},
	subscriptions(input) {
		return Sub.batch([
			RequestTimeout.subscriptions(input),
			// Browser.onInterectionObverivations(input.ctx.containerHtmlId, () => ({
			// })
			// )
		
		]) 
	},
};
