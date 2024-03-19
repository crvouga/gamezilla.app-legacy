import { isErr } from "gamezilla-app/@SHARED/core";
import { FlowVariantUIEdit, FlowVariantUIPlay } from "../../../../@SHARED/flow";
import { SyncReducer } from "../../create.core";
const reducer: SyncReducer = ({ modelSync, msgSync }) => {
    switch (msgSync.t) {
        case "user-created-puzzle": {
            if (isErr(msgSync.created)) {
                return modelSync;
            }
            const puzzleNew = msgSync.created.value;
            return {
                ...modelSync,
                listTab: modelSync.listTab,
                opened: { t: "puzzle-builder" },
                packBuilder: modelSync.packBuilder,
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
            return modelSync;
        }
    }
};
export const PuzzleCreateGame = { reducer };
