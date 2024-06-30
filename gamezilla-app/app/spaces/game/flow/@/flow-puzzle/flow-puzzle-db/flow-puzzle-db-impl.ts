import type { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import type { IFlowPuzzleDb } from "./flow-puzzle-db";
import { FlowPuzzleDbHashMap } from "./flow-puzzle-db-impl-hash-map";
import { FlowPuzzleDbPostgres } from "./flow-puzzle-db-impl-postgres";
import { ILogger } from "gamezilla-app/app/@/server/logger";
import { WithSolutions } from "./with-solutions";
import { pipe } from "gamezilla-app/@/core";

export type FlowPuzzleDbImpl =
	| { t: "hash-map" }
	| { t: "db-conn-sql"; dbConnSql: IDbConnSql; logger: ILogger };

const FlowPuzzleDbBase = (impl: FlowPuzzleDbImpl): IFlowPuzzleDb => {
	switch (impl.t) {
		case "hash-map": {
			return FlowPuzzleDbHashMap();
		}
		case "db-conn-sql": {
			return FlowPuzzleDbPostgres(impl);
		}
	}
};

export const FlowPuzzleDb = (impl: FlowPuzzleDbImpl): IFlowPuzzleDb => {
	return pipe(FlowPuzzleDbBase(impl), WithSolutions);
};
