import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import type { ServerModule } from "../builder.types";
import { DeleteForeverServer } from "./delete-forever/delete-forever.server";
import { EditPuzzleNameServer } from "./edit-puzzle-name/edit-puzzle-name.server";
import { SaveChangesServer } from "./save-changes/save-changes.server";

const update: ServerModule["update"] = async (input) => {
	return GameServerModule.andThen(
		{ model: input.model },
		(model) => DeleteForeverServer.update({ ...input, model }),
		(model) => EditPuzzleNameServer.update({ ...input, model }),
		(model) => SaveChangesServer.update({ ...input, model }),
	);
};

export const ScreenPuzzleBuilderServer: Pick<ServerModule, "update"> = {
	update,
};
