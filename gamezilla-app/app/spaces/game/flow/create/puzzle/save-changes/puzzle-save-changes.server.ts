import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { Result } from "gamezilla-app/@/core";
import type { ServerModule } from "../../create.core";
import type { MsgCore } from "./puzzle-save-changes.core";

const update: ServerModule["update"] = async (input) => {
	return GameServerModule.andThen({ model: input.model }, (model) =>
		updateFromClient({ ...input, model }),
	);
};

const updateFromClient: ServerModule["update"] = async (input) => {
	const { ctx, msgClient, model, deps } = input;

	switch (msgClient?.t) {
		case "puzzle-save-changes.user-clicked-save-and-exit":
		case "puzzle-save-changes.user-clicked-save-button": {
			const saved = await deps.FlowPuzzleDb.put({
				...msgClient.puzzle,
				lastUpdatedBy: msgClient.userId,
				lastUpdatedAt: ctx.now,
			});

			const msgCore: MsgCore = {
				t: "puzzle-builder.saved-puzzle",
				saved: Result.mapOk(saved, () => msgClient.puzzle),
				userId: msgClient.puzzle.createdBy,
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

export const PuzzleSaveChangesServer = {
	update,
};
