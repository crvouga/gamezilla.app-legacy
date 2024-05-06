import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import { FlowServerDeps } from "../../../create.types";
import { MsgCore, ModelCore } from "./edit-pack-name.types";

type ServerModule = GameServerModule<{
	Deps: FlowServerDeps;
	MsgCore: MsgCore;
	ModelCore: ModelCore;
}>;

const update: ServerModule["update"] = async (input) => {
	return { model: input.model };
};

export const EditPackNameServer = {
	update,
};
