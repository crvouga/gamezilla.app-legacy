import { Result } from "gamezilla/@SHARED/core";
import { FlowGrid } from "../flow";

export type IFlowDb = {
  findMany: (query: any) => Promise<Result<string, FlowGrid.Model[]>>;
};
