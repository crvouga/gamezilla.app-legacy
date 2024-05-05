import type { ServerModule } from "../../create.types";

const update: ServerModule["update"] = async (input) => {
	return { model: input.model };
};

export const PuzzleListServer = {
	update,
};
