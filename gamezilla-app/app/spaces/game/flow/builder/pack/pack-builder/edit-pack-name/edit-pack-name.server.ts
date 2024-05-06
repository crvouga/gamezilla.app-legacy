import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import { FlowServerDeps } from "../../../builder.types";
import { EditPackNameCore } from "./edit-pack-name.core";
import { ModelCore, MsgCore } from "./edit-pack-name.types";

type ServerModule = GameServerModule<{
	Deps: FlowServerDeps;
	MsgCore: MsgCore;
	ModelCore: ModelCore;
	Ctx: SpaceCtx;
}>;

const update: ServerModule["update"] = async (input) => {
	switch (input.msgCore?.t) {
		case "edit-pack-name.user-clicked-save-button": {
			const modelCoreNext = EditPackNameCore.update({
				ctx: input.ctx,
				model: input.modelCore,
				msg: input.msgCore,
			});
			const put = await input.deps.FlowPackDb.put(modelCoreNext.pack);
			return {
				model: input.model,
				msgCore: [
					withId({
						t: "edit-pack-name.server-persisted-pack",
						result: put,
						userId: input.msgCore.userId,
					}),
				],
			};
		}
	}
	return { model: input.model };
};

export const EditPackNameServer = {
	update,
};
