import { Eff, isErr } from "gamezilla-app/@/core";
import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { SpaceServerCmd } from "gamezilla-app/app/spaces/@/space-server-cmd";

import { FlowPackGridServer } from "../../../@/flow-pack/flow-pack-grid/flow-pack-grid.server";
import type { ServerModule } from "../../builder.types";
import { EditPackNameServer } from "./edit-pack-name/edit-pack-name.server";
import { PackBuilderCore } from "./pack-builder.core";

const SavePack: Pick<ServerModule, "update"> = {
	async update(input) {
		const { deps, model, modelCore, msgCore } = input;

		switch (msgCore?.t) {
			case "pack-builder.user-clicked-add-puzzle-item": {
				if (!modelCore.packBuilder) {
					return { model };
				}

				const saved = await deps.FlowPackDb.put(modelCore.packBuilder.pack);

				return {
					model,
					msgCore: [withId({ t: "pack-builder.saved-pack", saved })],
				};
			}

			default: {
				return { model };
			}
		}
	},
};

const PuzzleGrid: Pick<ServerModule, "update"> = {
	async update(input) {
		const pack = input.modelCore.packBuilder?.pack;

		if (!pack) {
			return { model: input.model };
		}

		const ctx = { ...input.ctx, pack };

		const updated = await FlowPackGridServer.update({
			ctx,
			model: {},
			msg: input.msg?.t === "pack-builder.flow-pack-grid" ? input.msg.c : null,
			msgCmd: input.msgCmd,
			msgClient:
				input.msgClient?.t === "pack-builder.flow-pack-grid"
					? { ...input.msgClient, ...input.msgClient.c }
					: null,
			deps: input.deps,
			msgEvt: input.msgEvt,
		});

		return {
			model: input.model,
			eff: Eff.tag("pack-builder.flow-pack-grid", updated.eff),
			msgCmd: SpaceServerCmd.tag("pack-builder.flow-pack-grid", updated.msgCmd),
			msgEvt: updated.msgEvt,
			msgCore: [],
		};
	},
};

const RemovedPuzzleFromPack: Pick<ServerModule, "update"> = {
	async update(input) {
		switch (input.msgCore?.t) {
			case "remove-puzzle-from-pack.user-clicked-remove-from-pack-button": {
				const modelCoreNew = PackBuilderCore.update({
					ctx: input.ctx,
					modelCore: input.modelCore,
					msgCore: input.msgCore,
				});
				const packNew = modelCoreNew.packBuilder?.pack;
				if (!packNew) {
					return { model: input.model };
				}
				const put = await input.deps.FlowPackDb.put(packNew);
				if (isErr(put)) {
					return { model: input.model };
				}
				return { model: input.model };
			}
		}
		return { model: input.model };
	},
};

const EditPackName: Pick<ServerModule, "update"> = {
	async update(input) {
		if (!input.modelCore.packBuilder) {
			return { model: input.model };
		}
		const updated = await EditPackNameServer.update({
			...input,
			modelCore: input.modelCore.packBuilder.editPackName,
			msgCore:
				input.msgCore?.t === "got-edit-pack-name"
					? { ...input.msgCore, ...input.msgCore.c }
					: null,
		});
		return {
			model: input.model,
			msgCore: (updated.msgCore ?? []).map(({ eventId, ...c }) => ({
				eventId,
				c,
				t: "got-edit-pack-name",
			})),
		};
	},
};

export const PackBuilderServer: Pick<ServerModule, "update"> = {
	async update(input) {
		return GameServerModule.andThen(
			{ model: input.model },
			(model) => SavePack.update({ ...input, model }),
			(model) => RemovedPuzzleFromPack.update({ ...input, model }),
			(model) => PuzzleGrid.update({ ...input, model }),
			(model) => EditPackName.update({ ...input, model }),
		);
	},
};
