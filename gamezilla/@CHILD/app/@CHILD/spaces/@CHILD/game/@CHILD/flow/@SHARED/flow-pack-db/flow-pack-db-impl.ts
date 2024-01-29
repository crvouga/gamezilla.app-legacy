import { IFlowPackDb } from "./flow-pack-db";
import { FlowPackDbHashMap } from "./flow-pack-db-impl-hash-map";

export const FlowPuzzleDb = (): IFlowPackDb => {
  return FlowPackDbHashMap();
};
