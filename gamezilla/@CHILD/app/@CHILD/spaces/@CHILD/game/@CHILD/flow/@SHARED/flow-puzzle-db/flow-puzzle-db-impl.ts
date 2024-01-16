import { IFlowPuzzleDb } from "./flow-puzzle-db";
import { FlowPuzzleDbHashMap } from "./flow-puzzle-db-impl-hash-map";

export const FlowPuzzleDb = (): IFlowPuzzleDb => {
  return FlowPuzzleDbHashMap();
};
