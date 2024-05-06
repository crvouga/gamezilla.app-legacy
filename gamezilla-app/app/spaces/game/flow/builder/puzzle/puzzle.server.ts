import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import { type ServerModule } from "../builder.types";
import { PuzzleCreateServer } from "./create/puzzle-create.server";
import { PuzzleDeleteForeverServer } from "./delete-forever/puzzle-delete-forever.server";
import { PuzzleEditNameServer } from "./edit/puzzle-edit-name.server";
import { PuzzleListServer } from "./list/puzzle-list.server";
import { PuzzleSaveChangesServer } from "./save-changes/puzzle-save-changes.server";

const update: ServerModule["update"] = async (input) => {
	return GameServerModule.andThen(
		{ model: input.model },
		//
		(model) => PuzzleListServer.update({ ...input, model }),
		(model) => PuzzleCreateServer.update({ ...input, model }),
		(model) => PuzzleDeleteForeverServer.update({ ...input, model }),
		(model) => PuzzleEditNameServer.update({ ...input, model }),
		(model) => PuzzleSaveChangesServer.update({ ...input, model }),
	);
};

export const PuzzleServer: Pick<ServerModule, "update"> = {
	update,
};
