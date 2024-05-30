import { sendToUser } from "gamezilla-app/app/@/server";
import { SpaceServerModule } from "../architecture/space-server";
import { SpaceCore } from "../spaces-core";
import * as SpacesCoreServer from "../spaces-core/spaces-core.server";

const update: SpaceServerModule["update"] = (input) => {
	return SpaceServerModule.andThen(
		{ model: input.model },
		//
		(model) => updateFromSpaceEvent({ ...input, model }),
	);
};

const updateFromSpaceEvent: SpaceServerModule["update"] = async (input) => {
	const { model, msgSpaceEvent, deps } = input;
	switch (msgSpaceEvent?.t) {
		case "user-joined-space": {
			const space = await SpacesCoreServer.getSpaceById(
				deps.SpacesDb,
				msgSpaceEvent.spaceId,
			);

			if (!space) {
				return { model };
			}

			const started = SpaceCore.startFromLatestSnapshot(space);

			return {
				model,
				msgCmd: [
					sendToUser([msgSpaceEvent.userId], {
						t: "synced",
						space: started,
						causedBy: msgSpaceEvent.t,
					}),
				],
			};
		}

		default: {
			return { model: input.model };
		}
	}
};

export const JoinSpaceServer = {
	update,
};
