import { RequestResponse, isErr } from "gamezilla-app/@/core";
import { sendToServer } from "gamezilla-app/app/@/client";
import {
	IconDeleteForever,
	ListItemButton,
} from "gamezilla-app/app/@/ui";
import {
	type GameClientModule,
	andThen,
} from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import type { SpaceClientEvent } from "gamezilla-app/app/spaces/@/space";
import type { FlowClientCmd } from "../../../@/flow-ctx";
import { FlowPack } from "../../../@/flow-pack";
import type {
	ModelClient,
	ModelSync,
	MsgClient,
	MsgSync,
	MsgToClient,
	MsgToServer,
	RemovePuzzleClientCtx,
} from "./remove-puzzle.core";

type Module = GameClientModule<{
	Model: ModelClient;
	ModelSync: ModelSync;
	Msg: MsgClient;
	MsgSync: MsgSync;
	Ctx: RemovePuzzleClientCtx;
	MsgInCmd: never;
	MsgInEvent: SpaceClientEvent;
	MsgOutCmd: FlowClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: MsgToServer;
	}>;
	MsgOutEvent: never;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
}>;

const ViewListItem: Module["View"] = (_input) => {
	return (
		<>
			<ListItemButton
				icon={(props) => <IconDeleteForever {...props} />}
				label="Remove from pack"
				color="danger"
			/>
		</>
	);
};

const update: Module["update"] = (input) => {
	const { model, msgServer, msg, ctx } = input;

	switch (msg?.t) {
		case "remove-puzzle.clicked-remove-from-pack-button": {
			return {
				model: {
					...model,
					removePuzzleRequest: RequestResponse.requesting(ctx.now),
				},
				msgCmd: [
					sendToServer({ t: "remove-puzzle.clicked-remove-from-pack-button" }),
				],
			};
		}
	}

	switch (msg?.t) {
		case "remove-puzzle.time-passed": {
			return {
				model: {
					...model,
					removePuzzleRequest: RequestResponse.elapsed(
						model.removePuzzleRequest,
						ctx.now,
					),
				},
			};
		}
	}

	switch (msgServer?.t) {
		case "remove-puzzle.removed": {
			return andThen(
				{ model },
				(model) => {
					return {
						model: {
							...model,
							removePuzzleRequest: RequestResponse.response(
								model.removePuzzleRequest,
								ctx.now,
								msgServer.result,
							),
						},
					};
				},
				(model) => {
					if (isErr(msgServer.result)) {
						return { model };
					}

					const packNew = FlowPack.removePuzzleAtIndex(
						ctx.pack,
						msgServer.packPuzzleIndex,
					);

					return {
						model: {
							...model,
							packs: {
								...model.packs,
								[packNew.id]: packNew,
							},
						},
					};
				},
			);
		}
	}

	return { model };
};

const subscriptions: Module["subscriptions"] = (input) => {
	const { model } = input;

	return RequestResponse.subscriptions(model.removePuzzleRequest, () => ({
		t: "remove-puzzle.time-passed",
	}));
};

export const RemovePuzzleClient = {
	update,
	ViewListItem,
	subscriptions,
};
