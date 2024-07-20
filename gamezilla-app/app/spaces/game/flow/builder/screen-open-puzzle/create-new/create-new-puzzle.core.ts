import { isErr } from "gamezilla-app/@/core";
import type { UpdateCore } from "../../builder.types";
import { FlowEdit } from "../../../@/flow/flow-edit";
import { FlowPlay } from "../../../@/flow/flow-play";

const updateCore: UpdateCore = ({ modelCore, msgCore }) => {
	switch (msgCore.t) {
		case "user-created-puzzle": {
			if (isErr(msgCore.created)) {
				return modelCore;
			}
			const flowPuzzleNew = msgCore.created.value;
			return {
				...modelCore,
				listTab: modelCore.listTab,
				opened: { t: "puzzle-builder" },
				packBuilder: modelCore.packBuilder,
				puzzleBuilder: {
					t: "puzzle-builder",
					mode: { t: "edit" },
					edit: FlowEdit.init({ flow: flowPuzzleNew.flow }),
					play: FlowPlay.init({ ctx: { flowPuzzle: flowPuzzleNew } }),
					puzzle: flowPuzzleNew,
				},
			};
		}

		default: {
			return modelCore;
		}
	}
};

export const CreateNewPuzzleCore = { updateCore };
