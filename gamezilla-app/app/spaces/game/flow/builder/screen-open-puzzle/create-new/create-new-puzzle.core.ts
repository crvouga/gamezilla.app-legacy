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
			const puzzleNew = msgCore.created.value;
			return {
				...modelCore,
				listTab: modelCore.listTab,
				opened: { t: "puzzle-builder" },
				packBuilder: modelCore.packBuilder,
				puzzleBuilder: {
					t: "puzzle-builder",
					mode: { t: "edit" },
					edit: FlowEdit.init({ flow: puzzleNew.flow }),
					play: FlowPlay.init({ flowPuzzle: puzzleNew }),
					puzzle: puzzleNew,
				},
			};
		}

		default: {
			return modelCore;
		}
	}
};

export const CreateNewPuzzleCore = { updateCore };
