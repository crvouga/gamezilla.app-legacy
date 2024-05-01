import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import type { ClientCmd, ClientCmdTypes } from "gamezilla-app/app/@/client";
import type { FlowPuzzle } from "./flow-puzzle/flow-puzzle";
import type { FlowPuzzleId } from "./flow-puzzle/flow-puzzle-id";

export type FlowClientCtx = SpaceClientCtx & {
	onQuit: () => void;
};

export type FlowCmd = {
	t: "flow";
	c: {
		t: "add-puzzles";
		puzzles: {
			[flowPuzzleId: FlowPuzzleId]: FlowPuzzle;
		};
	};
};

export type FlowClientCmd<T extends ClientCmdTypes> = ClientCmd<T> | FlowCmd;
