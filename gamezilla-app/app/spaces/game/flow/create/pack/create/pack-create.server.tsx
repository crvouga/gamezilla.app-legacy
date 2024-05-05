import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import { sendBack } from "gamezilla-app/app/@/server";
import type { FlowPack } from "../../../@/flow-pack/flow-pack";
import { FlowPackId } from "../../../@/flow-pack/flow-pack-id";
import { FlowPackName } from "../../../@/flow-pack/flow-pack-name";
import type { ServerModule } from "../../create.types";

const update: ServerModule["update"] = async (input) => {
	return GameServerModule.andThen({ model: input.model }, (model) =>
		updateFromClient({ ...input, model }),
	);
};

const updateFromClient: ServerModule["update"] = async (input) => {
	const { model, msgClient, ctx, deps } = input;

	switch (msgClient?.t) {
		case "pack-create.clicked-create-button": {
			const counted = await deps.FlowPackDb.count({
				where: {
					createdBy: msgClient.userId,
				},
			});

			if (counted.t === "err") {
				return { model };
			}

			const packNew: FlowPack = {
				createdAt: ctx.now,
				createdBy: msgClient.userId,
				id: FlowPackId.generate(),
				lastUpdatedAt: ctx.now,
				lastUpdatedBy: msgClient.userId,
				name: await FlowPackName.generate({ count: counted.value }),
				puzzleIds: [],
			};

			const put = await deps.FlowPackDb.put(packNew);

			return {
				model: {
					...model,
				},
				msgCmd: [
					sendBack(msgClient, {
						t: "pack-create.created-pack",
						created: put,
					}),
				],
			};
		}

		default: {
			return { model };
		}
	}
};

export const PackCreateServer = {
	update,
};
