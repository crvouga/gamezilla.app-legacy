import { sendBack } from "gamezilla-app/app/@shared/server";
import type { SpaceServerModule } from "../architecture/space-server";
import * as Space from "../spaces-core/space";
import { SpacesCoreServer } from "../spaces-core/spaces-core.server";
import { Result } from "gamezilla-app/@shared/core";

//
//
//
// Update
//
//
//

const update: SpaceServerModule["update"] = async (input) => {
	const { msgClient, model, deps } = input;

	switch (msgClient?.t) {
		case "list-spaces": {
			const spaces = await SpacesCoreServer.listSpaces({
				spacesDb: input.deps.SpacesDb,
				limit: msgClient.limit,
				offset: msgClient.offset,
				where: msgClient.where,
			});

			const started = spaces.map(Space.startFromLatestSnapshot);

			const userIds = spaces.flatMap((space) => Space.toUserIds(space));

			const profiles = Result.withDefault(
				await deps.ProfileCache.get(userIds),
				{},
			);

			return {
				model,
				msgCmd: [
					sendBack(msgClient, {
						t: "listed-spaces",
						spaces: started,
						causedBy: msgClient.t,
						profiles,
					}),
				],
			};
		}
	}

	return { model };
};

//
//
//
//
//
//

export const ListSpacesServer = {
	update,
};
