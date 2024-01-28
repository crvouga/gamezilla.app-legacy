import { ok } from "gamezilla/@SHARED/core";
import { FlowPuzzle } from "../flow-puzzle/flow-puzzle";
import { IFlowPuzzleDb } from "./flow-puzzle-db";

const db = new Map<string, FlowPuzzle>();

export const FlowPuzzleDbHashMap = (): IFlowPuzzleDb => {
  return {
    async get(id) {
      await new Promise((r) => setTimeout(r, 500));
      const puzzle = db.get(id) ?? null;
      return ok(puzzle);
    },
    async list(input) {
      await new Promise((r) => setTimeout(r, 500));

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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      db.set(input.id, input);
      return ok(null);
    },

    async zap(id) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      db.delete(id);
      return ok(null);
    },
  };
};
