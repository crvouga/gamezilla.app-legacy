import { Sub } from "gamezilla-app/@/core";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import type { ClientModule } from "../builder.types";
import { PackBuilderClient } from "./screen-pack-builder/pack-builder.client";
import { PackCreateNewClient } from "./create-new-pack/pack-create-new.client";
import { PackListClient } from "./screen-open-pack/screen-open-pack.client";

export const PackClient: Pick<ClientModule, "update" | "subscriptions"> = {
	update(input) {
		return GameClientModule.andThen(
			{ model: input.model },
			(model) => PackListClient.update({ ...input, model }),
			(model) => PackCreateNewClient.update({ ...input, model }),
			(model) => PackBuilderClient.update({ ...input, model }),
		);
	},
	subscriptions(input) {
		return Sub.batch([PackBuilderClient.subscriptions(input)]);
	},
};
