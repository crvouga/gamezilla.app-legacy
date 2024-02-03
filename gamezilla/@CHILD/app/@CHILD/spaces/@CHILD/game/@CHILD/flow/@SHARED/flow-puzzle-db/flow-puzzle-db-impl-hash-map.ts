import { err, isErr, ok } from "gamezilla/@SHARED/core";
import { FlowPuzzle } from "../flow-puzzle/flow-puzzle";
import { IFlowPuzzleDb } from "./flow-puzzle-db";

const db = new Map<string, FlowPuzzle>();

const calls = {
  get: 0,
  put: 0,
  zap: 0,
  list: 0,
  count: 0,
};

const ERROR_EVERY = Infinity;

export const FlowPuzzleDbHashMap = (): IFlowPuzzleDb => {
  return {
    async get(id) {
      calls.get++;
      await new Promise((r) => setTimeout(r, 500));

      if (calls.get % ERROR_EVERY === 0) {
        return err("get demo error");
      }

      const puzzle = db.get(id) ?? null;
      return ok(puzzle);
    },

    async count(input) {
      calls.count++;
      if (calls.count % ERROR_EVERY === 0) {
        return err("count demo error");
      }
      const listed = await this.list({
        order: { createdAt: "asc" },
        pagination: { limit: 0, offset: 0 },
        where: input.where,
      });

      if (isErr(listed)) {
        return listed;
      }

      return ok(listed.value.total);
    },

    async list(input) {
      calls.list++;
      await new Promise((r) => setTimeout(r, 500));
      if (calls.list % ERROR_EVERY === 0) {
        return err("list demo error");
      }

      const puzzles = Array.from(db.values());

      const filtered = puzzles.filter((puzzle) => {
        if (
          input.where.createdBy &&
          puzzle.createdBy !== input.where.createdBy
        ) {
          return false;
        }

        return true;
      });

      const ordered = filtered.sort((a, b) => {
        if (input.order.createdAt === "asc") {
          return a.createdAt - b.createdAt;
        }

        if (input.order.createdAt === "desc") {
          return b.createdAt - a.createdAt;
        }

        if (input.order.lastUpdatedAt === "asc") {
          return a.lastUpdatedAt - b.lastUpdatedAt;
        }

        if (input.order.lastUpdatedAt === "desc") {
          return b.lastUpdatedAt - a.lastUpdatedAt;
        }

        return b.createdAt - a.createdAt;
      });

      const sliced = ordered.slice(
        input.pagination.offset,
        input.pagination.offset + input.pagination.limit
      );

      return ok({
        items: sliced,
        total: filtered.length,
        limit: input.pagination.limit,
        offset: input.pagination.offset,
      });
    },

    async put(input) {
      calls.put++;

      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (calls.put % ERROR_EVERY === 0) {
        return err("put demo error");
      }
      db.set(input.id, input);
      return ok(null);
    },

    async zap({ id }) {
      calls.zap++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (calls.zap % ERROR_EVERY === 0) {
        return err("zap demo error");
      }
      db.delete(id);
      return ok(null);
    },
  };
};
