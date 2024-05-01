import { sendBack } from "gamezilla-app/app/@shared/server";
import type { ServerModule } from "./flow-pack-list.core";
import { AppServerModule } from "gamezilla-app/app/@shared/architecture/app-server";

const update: ServerModule["update"] = async (input) => {
	return AppServerModule.andThen(
		{ model: input.model },
		(model) => updateListPacks({ ...input, model }),
		//
	);
};

const updateListPacks: ServerModule["update"] = async (input) => {
	const { msgClient, model, deps } = input;

	switch (msgClient?.t) {
		case "list-packs": {
			const listed = await deps.FlowPackDb.list(msgClient.input);

			return {
				model: input.model,
				msgCmd: [sendBack(msgClient, { t: "listed-packs", listed })],
			};
		}

		default: {
			return { model };
		}
	}
};

export const FlowPackListServer = {
	update,
};
