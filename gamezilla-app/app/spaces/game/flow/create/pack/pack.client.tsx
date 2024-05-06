import { Sub } from "gamezilla-app/@/core";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { type ClientModule } from "../create.types";
import { PackBuilderClient } from "./pack-builder/pack-builder.client";
import { PackCreateClient } from "./create/pack-create.client";
import { PackListClient } from "./list/pack-list.client";

export const PackClient: Pick<ClientModule, "update" | "subscriptions"> = {
	update(input) {
		return GameClientModule.andThen(
			{ model: input.model },
			(model) => PackListClient.update({ ...input, model }),
			(model) => PackCreateClient.update({ ...input, model }),
			(model) => PackBuilderClient.update({ ...input, model }),
		);
	},
	subscriptions(input) {
		return Sub.batch([PackBuilderClient.subscriptions(input)]);
	},
};
