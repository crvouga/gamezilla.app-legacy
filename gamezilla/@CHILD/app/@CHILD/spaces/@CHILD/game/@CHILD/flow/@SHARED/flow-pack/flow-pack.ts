import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";
import { FlowPuzzleId } from "../flow-puzzle/flow-puzzle-id";
import { FlowPackId } from "./flow-pack-id";
import { FlowPackName } from "./flow-pack-name";

export type FlowPack = {
  id: FlowPackId;
  createdBy: UserId;
  createdAt: Posix;
  lastUpdatedBy: UserId;
  lastUpdatedAt: Posix;
  name: FlowPackName;
  puzzleIds: FlowPuzzleId[];
};
