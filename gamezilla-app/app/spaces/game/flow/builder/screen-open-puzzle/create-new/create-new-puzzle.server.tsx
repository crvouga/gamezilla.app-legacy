import { Result, isErr } from "gamezilla-app/@/core";
import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { FlowVariant, FlowVariantDimensions } from "../../../@/flow";
import { FlowPuzzle } from "../../../@/flow-puzzle/flow-puzzle";
import type { ServerModule } from "../../builder.types";
import type { MsgCore } from "./create-new-puzzle.types";

const update: ServerModule["update"] = async (input) => {
	return GameServerModule.andThen({ model: input.model }, (model) =>
		updateFromClient({ ...input, model }),
	);
};

const updateFromClient: ServerModule["update"] = async (input) => {
	const { msgClient, model, ctx, deps } = input;

	switch (msgClient?.t) {
		case "puzzle-create.user-clicked-create-button": {
			const counted = await deps.flowPuzzleDb.count({
				where: {
					createdBy: {
						equals: msgClient.userId,
					},
				},
			});

			if (isErr(counted)) {
				console.error(counted.error);
			}

			const count = Result.withDefault(counted, 0);

			const puzzleNew = await FlowPuzzle.create({
				count: count,
				createdAt: ctx.now,
				createdBy: msgClient.userId,
				flow: FlowVariant.init({
					terminalsByGroupId: {},
					dimensions: FlowVariantDimensions.init({
						t: "flow-grid",
						height: 8,
						width: 8,
					}),
				}),
			});

			const created = await deps.flowPuzzleDb.put(puzzleNew);

			const msgCore: MsgCore = {
				t: "user-created-puzzle",
				created: Result.mapOk(created, () => puzzleNew),
				userId: msgClient.userId,
			};

			return {
				model,
				msgCore: [withId(msgCore)],
			};
		}

		default: {
			return { model };
		}
	}
};

export const CreateNewPuzzleServer = {
	update,
};
