import type { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import type { IFlowPuzzleDb } from "./flow-puzzle-db";
import { FlowPuzzleDbHashMap } from "./flow-puzzle-db-impl-hash-map";
import { FlowPuzzleDbPostgres } from "./flow-puzzle-db-impl-postgres";

export type FlowPuzzleDbImpl =
	| { t: "hash-map" }
	| { t: "postgres"; dbConnSql: IDbConnSql };

export const FlowPuzzleDb = (impl: FlowPuzzleDbImpl): IFlowPuzzleDb => {
	switch (impl.t) {
		case "hash-map": {
			return FlowPuzzleDbHashMap();
		}
		case "postgres": {
			return FlowPuzzleDbPostgres(impl);
		}
	}
};
