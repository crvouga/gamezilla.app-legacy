import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import { type ServerModule } from "../create.types";
import { PackBuilderServer } from "./builder/pack-builder.server";
import { PackCreateServer } from "./create/pack-create.server";

const update: ServerModule["update"] = async (input) => {
	return GameServerModule.andThen(
		{ model: input.model },
		(model) => PackCreateServer.update({ ...input, model }),
		(model) => PackBuilderServer.update({ ...input, model }),
	);
};

export const PackServer = {
	update,
};
