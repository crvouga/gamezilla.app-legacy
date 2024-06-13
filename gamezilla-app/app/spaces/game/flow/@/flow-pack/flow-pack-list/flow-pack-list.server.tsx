import { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import { sendToClient } from "gamezilla-app/app/@/server";
import type { ServerModule } from "./flow-pack-list.types";

const update: ServerModule["update"] = async (input) => {
	return AppServerModule.andThen({ model: input.model }, (model) =>
		updateListPacks({ ...input, model }),
	);
};

const updateListPacks: ServerModule["update"] = async (input) => {
	switch (input.msgClient?.t) {
		case "list-packs": {
			const listed = await input.deps.flowPackDb.list(input.msgClient.input);

			return {
				model: input.model,
				msgCmd: [sendToClient(input.msgClient, { t: "listed-packs", listed })],
			};
		}

		default: {
			return { model: input.model };
		}
	}
};

export const FlowPackListServer = {
	update,
};
