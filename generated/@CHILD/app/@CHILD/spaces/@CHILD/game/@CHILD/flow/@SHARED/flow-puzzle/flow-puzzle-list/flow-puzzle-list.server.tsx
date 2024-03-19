import { sendBack } from "gamezilla-app/@CHILD/app/@SHARED/server";
import { ServerModule } from "./flow-puzzle-list.core";
import { AppServerModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-server";
const update: ServerModule["update"] = async (input) => {
    return AppServerModule.andThen({ model: input.model }, (model) => updateListPuzzles({ ...input, model }));
};
const updateListPuzzles: ServerModule["update"] = async (input) => {
    const { msgClient, model, deps } = input;
    switch (msgClient?.t) {
        case "flow-puzzle-list.list-puzzles": {
            const listed = await deps.FlowPuzzleDb.list(msgClient.input);
            return {
                model: input.model,
                msgCmd: [
                    sendBack(msgClient, { t: "flow-puzzle-list.listed-puzzle", listed }),
                ],
            };
        }
        default: {
            return { model };
        }
    }
};
export const FlowPuzzleListServer = {
    update,
};
