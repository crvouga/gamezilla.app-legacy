import { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import { sendBack } from "gamezilla-app/app/@/server";
import type {
	SpaceServerCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@/space";
import type { SpaceServerCmd } from "gamezilla-app/app/spaces/@/space-server-cmd";
import type { FlowServerDeps } from "../../../create/create.core";
import type {
	ModelServer,
	MsgServer,
	MsgToClient,
	MsgToServer,
} from "./flow-pack-puzzle-grid.core";

type ServerModule = AppServerModule<{
	Ctx: SpaceServerCtx;
	Model: ModelServer;
	Msg: MsgServer;
	MsgInCmd: null;
	MsgInEvent: SpaceServerEvent;
	MsgOutCmd: SpaceServerCmd<MsgToClient>;
	MsgOutEvent: null;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	Deps: FlowServerDeps;
}>;

const ListPuzzlesById: Pick<ServerModule, "update"> = {
	async update(input) {
		switch (input.msgClient?.t) {
			case "list-puzzles-by-id": {
				const listed = await input.deps.FlowPuzzleDb.list({
					pagination: {
						limit: Number.POSITIVE_INFINITY,
						offset: 0,
					},
					order: {
						createdAt: "asc",
					},
					where: {
						puzzleId: {
							in: input.msgClient.puzzleIds,
						},
					},
				});
				return {
					model: input.model,
					msgCmd: [
						sendBack(input.msgClient, {
							t: "listed-puzzles-by-id",
							listed,
						}),
					],
				};
			}
		}
		return { model: input.model };
	},
};

export const FlowPackPuzzleGridServer: Pick<ServerModule, "update"> = {
	async update(input) {
		return AppServerModule.andThen(
			{ model: input.model },
			(model) => ListPuzzlesById.update({ ...input, model }),
			//
		);
	},
};
