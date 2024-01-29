import { err } from "gamezilla/@SHARED/core";
import { IFlowPackDb } from "./flow-pack-db";

export const FlowPackDbHashMap = (): IFlowPackDb => {
  return {
    async get(_id) {
      return err("Not implemented");
    },

    async count(_input) {
      return err("Not implemented");
    },

    async list(_input) {
      return err("Not implemented");
    },

    async put(_input) {
      return err("Not implemented");
    },

    async zap(_id) {
      return err("Not implemented");
    },
  };
};
