import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import type { UserId } from "gamezilla-app/app/@/data";
import { Err, isErr } from "gamezilla-app/@/core";
import type { FlowPuzzle } from "../../../@/flow-puzzle/flow-puzzle";
import type { IFlowPuzzleDb } from "../../../@/flow-puzzle/flow-puzzle-db";
import type { FlowPuzzleId } from "../../../@/flow-puzzle/flow-puzzle-id";
import { FlowPuzzleName } from "../../../@/flow-puzzle/flow-puzzle-name";
import type { ServerModule } from "../../builder.types";
import type { MsgCore } from "./puzzle-edit-name.types";

const update: ServerModule["update"] = async (input) => {
	return GameServerModule.andThen({ model: input.model }, (model) =>
		updateFromClient({ ...input, model }),
	);
};

const updateFromClient: ServerModule["update"] = async (input) => {
	const { msgClient, model, deps } = input;

	switch (msgClient?.t) {
		case "puzzle.edit-name.user-clicked-save-button": {
			const edited = await patchName({
				deps,
				flowPuzzleId: msgClient.flowPuzzleId,
				newName: msgClient.newName,
				userId: msgClient.userId,
			});

			const msgCore: MsgCore = {
				t: "user-edited-puzzle-name",
				edited,
				flowPuzzleId: msgClient.flowPuzzleId,
				newName: msgClient.newName,
				userId: msgClient.userId,
			};

			return {
				model,
				msgCore: [withId(msgCore)],
			};
		}

		default: {
			return { model };
		}
	}
};

const patchName = async (input: {
	flowPuzzleId: FlowPuzzleId;
	newName: string;
	userId: UserId;
	deps: { flowPuzzleDb: IFlowPuzzleDb };
}) => {
	const { flowPuzzleId, newName, userId, deps } = input;

	const result = await deps.flowPuzzleDb.get(flowPuzzleId);

	if (isErr(result)) {
		return result;
	}

	const puzzle = result.value;

	if (!puzzle) {
		return Err("Failed to find puzzle");
	}

	if (puzzle.createdBy !== userId) {
		return Err("You must be the creator of this puzzle to edit it.");
	}

	const newNameFinal =
		typeof newName === "string" && newName.length > 0 ? newName : puzzle.name;

	if (!FlowPuzzleName.is(newNameFinal)) {
		return Err("Invalid name");
	}

	const patched: FlowPuzzle = {
		...puzzle,
		name: newNameFinal,
		lastUpdatedBy: userId,
	};

	const put = await deps.flowPuzzleDb.put(patched);

	return put;
};

export const PuzzleEditNameServer: Pick<ServerModule, "update"> = {
	update,
};
