import { UserId } from "gamezilla-app/app/@/data";
import { FlowPuzzle } from "../flow-puzzle";
import { Posix } from "gamezilla-app/@/core";
import { FlowPuzzleName } from "../flow-puzzle/flow-puzzle-name";
import { FlowPuzzleId } from "../flow-puzzle/flow-puzzle-id";
import { FlowVariant, FlowVariantDimensions } from "../flow";
import { FlowPack } from "../flow-pack";
import { FlowPackId } from "../flow-pack/flow-pack-id";
import { FlowPackName } from "../flow-pack/flow-pack-name";

export const randomFlowPuzzle = async (input?: {
	createdBy?: UserId;
}): Promise<FlowPuzzle> => {
	const createdBy = input?.createdBy ?? UserId.generate();
	return {
		createdAt: Posix.now(),
		createdBy,
		name: await FlowPuzzleName.generate({
			count: 0,
		}),
		lastUpdatedAt: Posix.now(),
		lastUpdatedBy: createdBy,
		id: FlowPuzzleId.generate(),
		flow: FlowVariant.init({
			dimensions: FlowVariantDimensions.init({
				t: "flow-grid",
				height: 5,
				width: 5,
			}),
			terminalsByGroupId: {},
		}),
	};
};

export const randomFlowPack = async (input?: {
	createdBy?: UserId;
	puzzleIds?: FlowPuzzleId[];
}): Promise<FlowPack> => {
	const createdBy = input?.createdBy ?? UserId.generate();
	return {
		createdAt: Posix.now(),
		createdBy: createdBy,
		id: FlowPackId.generate(),
		lastUpdatedAt: Posix.now(),
		lastUpdatedBy: createdBy,
		name: await FlowPackName.generate({
			count: 0,
		}),
		puzzleIds: input?.puzzleIds ?? [],
	};
};
