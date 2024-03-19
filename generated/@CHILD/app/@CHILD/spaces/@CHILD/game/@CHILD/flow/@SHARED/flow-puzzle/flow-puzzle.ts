import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla-app/@SHARED/core";
import { FlowVariant } from "../flow";
import { FlowPuzzleId } from "./flow-puzzle-id";
import { FlowPuzzleName } from "./flow-puzzle-name";
export type FlowPuzzle = {
    id: FlowPuzzleId;
    name: FlowPuzzleName;
    createdAt: Posix;
    createdBy: UserId;
    lastUpdatedAt: Posix;
    lastUpdatedBy: UserId;
    flow: FlowVariant.Model;
};
const create = (input: {
    count: number;
    flow: FlowVariant.Model;
    createdAt: Posix;
    createdBy: UserId;
}): FlowPuzzle => {
    return {
        flow: input.flow,
        name: FlowPuzzleName.generate({ count: input.count }),
        id: FlowPuzzleId.generate(),
        createdAt: input.createdAt,
        createdBy: input.createdBy,
        lastUpdatedAt: input.createdAt,
        lastUpdatedBy: input.createdBy,
    };
};
export const FlowPuzzle = {
    create,
};
