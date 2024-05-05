import { isErr } from "gamezilla-app/@/core";
import { FlowVariantUIEdit, FlowVariantUIPlay } from "../../../@/flow";
import type { UpdateCore } from "../../create.types";

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
					edit: FlowVariantUIEdit.init({ flow: puzzleNew.flow }),
					play: FlowVariantUIPlay.init({ flow: puzzleNew.flow }),
					puzzle: puzzleNew,
				},
			};
		}

		default: {
			return modelCore;
		}
	}
};

export const PuzzleCreateCore = { updateCore };
