import { Posix } from "gamezilla-app/@/core";
import { UserId } from "gamezilla-app/app/@/data";
import { FlowVariant, FlowVariantDimensions } from "../flow";
import type { FlowPack } from "../flow-pack";
import { FlowPackId } from "../flow-pack/flow-pack-id";
import { FlowPackName } from "../flow-pack/flow-pack-name";
import type { FlowPuzzle } from "../flow-puzzle";
import { FlowPuzzleId } from "../flow-puzzle/flow-puzzle-id";
import { FlowPuzzleName } from "../flow-puzzle/flow-puzzle-name";

export const randomFlowPuzzle = async (input?: {
	createdBy?: UserId;
	createdAt?: Posix;
}): Promise<FlowPuzzle> => {
	const createdBy = input?.createdBy ?? UserId.generate();
	const createdAt = input?.createdAt ?? Posix.now();
	return {
		createdAt,
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
				height: 0,
				width: 0,
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
