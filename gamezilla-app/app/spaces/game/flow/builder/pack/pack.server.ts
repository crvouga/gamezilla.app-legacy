import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import type { ServerModule } from "../builder.types";
import { PackBuilderServer } from "./screen-pack-builder/pack-builder.server";
import { PackCreateNewServer } from "./create-new-pack/pack-create-new.server";

const update: ServerModule["update"] = async (input) => {
	return GameServerModule.andThen(
		{ model: input.model },
		(model) => PackCreateNewServer.update({ ...input, model }),
		(model) => PackBuilderServer.update({ ...input, model }),
	);
};

export const PackServer = {
	update,
};
