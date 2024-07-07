import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import type { ServerModule } from "../builder.types";
import { PuzzleDeleteForeverServer } from "./delete-forever/puzzle-delete-forever.server";
import { EditPuzzleNameServer } from "./edit-puzzle-name/edit-puzzle-name.server";
import { PuzzleSaveChangesServer } from "./save-changes/save-changes.server";

const update: ServerModule["update"] = async (input) => {
	return GameServerModule.andThen(
		{ model: input.model },
		(model) => PuzzleDeleteForeverServer.update({ ...input, model }),
		(model) => EditPuzzleNameServer.update({ ...input, model }),
		(model) => PuzzleSaveChangesServer.update({ ...input, model }),
	);
};

export const ScreenPuzzleBuilderServer: Pick<ServerModule, "update"> = {
	update,
};
