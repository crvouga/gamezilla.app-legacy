import type { ClientCmdTypes } from "gamezilla-app/app/@/client";
import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import { SpaceClientCmd } from "gamezilla-app/app/spaces/@/space-client-cmd";
import { FlowPack } from "./flow-pack";
import { FlowPackId } from "./flow-pack/flow-pack-id";
import type { FlowPuzzle } from "./flow-puzzle/flow-puzzle";
import type { FlowPuzzleId } from "./flow-puzzle/flow-puzzle-id";

export type FlowClientCtx = SpaceClientCtx & {
	onQuit: () => void;
	flowPacks: {
		[flowPackId: FlowPackId]: FlowPack;
	}
	flowPuzzles: {
		[flowPuzzleId: FlowPuzzleId]: FlowPuzzle;
	}
};

export type FlowCmd =
	| {
			t: "flow";
			c: {
				t: "new-puzzles";
				puzzles: {
					[flowPuzzleId: FlowPuzzleId]: FlowPuzzle;
				};
			};
	  }
	| {
			t: "flow";
			c: {
				t: "new-packs";
				packs: {
					[flowPackId: FlowPackId]: FlowPack;
				};
			};
	  };

export type FlowClientCmd<T extends ClientCmdTypes> = SpaceClientCmd<T> | FlowCmd;

const toSpaceClientCmds = <T extends ClientCmdTypes,>(cmds: FlowClientCmd<T>[]): SpaceClientCmd<T>[] => {
	return cmds.flatMap((cmd): SpaceClientCmd<T>[] => {
		if (cmd.t === 'flow') {
			return []
		}
		return [cmd]
	})
}

export const FlowClientCmd = {
	toSpaceClientCmds,
};