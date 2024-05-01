import type { ServerModule } from "../../create.core";

const update: ServerModule["update"] = async (input) => {
	return { model: input.model };
};

export const PuzzleListServer = {
	update,
};
