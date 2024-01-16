import { err } from "gamezilla/@SHARED/core";
import { FlowGrid } from "../flow";
import { IFlowDb } from "./flow-db";

export const _db = new Map<string, FlowGrid.Model>();

export const FlowDb = (): IFlowDb => {
  return {
    async findMany(_query) {
      return err("not implemented");
    },
  };
};
