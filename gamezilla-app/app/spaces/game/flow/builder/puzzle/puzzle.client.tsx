import { Sub } from "gamezilla-app/@/core";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import type { ClientModule } from "../builder.types";
import { PuzzleBuilderClient } from "./builder/puzzle-builder.client";
import { PuzzleCreateClient } from "./create/puzzle-create.client";
import { PuzzleDeleteForeverClient } from "./delete-forever/puzzle-delete-forever.client";
import { PuzzleEditNameClient } from "./edit/puzzle-edit-name.client";
import { PuzzleListClient } from "./list/puzzle-list.client";
import { PuzzleSaveChangesClient } from "./save-changes/puzzle-save-changes.client";

export const PuzzleClient: Pick<ClientModule, "update" | "subscriptions"> = {
	update(input) {
		return GameClientModule.andThen(
			{ model: input.model },

			(model) => PuzzleBuilderClient.update({ ...input, model }),
			(model) => PuzzleListClient.update({ ...input, model }),
			(model) => PuzzleEditNameClient.update({ ...input, model }),
			(model) => PuzzleDeleteForeverClient.update({ ...input, model }),
			(model) => PuzzleSaveChangesClient.update({ ...input, model }),
			(model) => PuzzleCreateClient.update({ ...input, model }),
		);
	},
	subscriptions(input) {
		return Sub.batch([
			//
			PuzzleCreateClient.subscriptions(input),
		]);
	},
};
