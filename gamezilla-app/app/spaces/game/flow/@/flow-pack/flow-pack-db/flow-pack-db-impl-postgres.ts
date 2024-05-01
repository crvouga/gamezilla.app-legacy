import { Err, Posix, Result, pipe } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import type { IFlowPackDb, WhereClause } from "./flow-pack-db";
import { FlowPack } from "../flow-pack";
import { UserId } from "gamezilla-app/app/@/data";
import { FlowPackId } from "../flow-pack-id";
import { FlowPackName } from "../flow-pack-name";
import { FlowPuzzleId } from "../../flow-puzzle/flow-puzzle-id";

const Row = p.obj({
  flow_pack_id: FlowPackId,
  flow_pack_name: FlowPackName,
  flow_puzzle_ids: p.arr(FlowPuzzleId),
  created_at_posix: p.or(p.num, p.str),
  created_by_user_id: UserId,
  last_updated_at_posix: p.or(p.num, p.str),
  last_updated_by_user_id: UserId,
  deleted_at_posix: p.or(p.num, p.str),
  deleted_by_user_id: UserId,
});

type Row = p.Infer<typeof Row>;

const rowToFlowPack = (row: Row): FlowPack | null => {
  return {
    createdAt: Posix.init(row.created_at_posix),
    createdBy: row.created_by_user_id,
    id: row.flow_pack_id,
    lastUpdatedAt: Posix.init(row.last_updated_at_posix),
    lastUpdatedBy: row.last_updated_by_user_id,
    name: row.flow_pack_name,
    puzzleIds: row.flow_puzzle_ids,
  };
};

const toSqlWhere = (where: WhereClause) => {
  const clauses: string[] = [];
  const variables: Record<string, any> = {};
  if (where.createdBy) {
    clauses.push("created_by_user_id = :created_by_user_id");
    variables["created_by_user_id"] = where.createdBy;
  }

  return { whereStr: clauses.join(" AND "), variables };
}

export const FlowPackDbPostgres = ({
  dbConnSql,
}: {
  dbConnSql: IDbConnSql;
}): IFlowPackDb => {
  return {
    async get(id) {
      const queried = await dbConnSql.query(
        Row,
        `SELECT * FROM game_flow_pack WHERE flow_pack_id = :flow_pack_id`,
        { flow_pack_id: id }
      );
      return Result.mapOk(queried, (row) =>
        row[0] ? rowToFlowPack(row[0]) : null
      );
    },

    async count(input) {
    
    
      const whereStr = pipe(
        [],
        (x) =>
          input.where.createdBy
            ? [...x, "created_by_user_id = :created_by_user_id"]
            : x,
        (x) => x.join(" AND "),
        (x) => (x.length > 0 ? `WHERE ${x}` : "")
      );

      const queried = await dbConnSql.query(
        p.obj({ count: p.num }),
        `SELECT COUNT(*) FROM game_flow_pack WHERE flow_pack_id = :flow_pack_id`,
        { flow_pack_id: id }
      );
      return Err("Not implemented");
    },

    async list() {
      return Err("Not implemented");
    },

    async put() {
      return Err("Not implemented");
    },

    async zap() {
      return Err("Not implemented");
    },
  };
};
