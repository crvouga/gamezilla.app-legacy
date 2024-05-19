import type { IDbConnSql } from "../db-conn-sql";
import type { ILogger } from "../logger/logger";
import type { IDbConnKv } from "./db-conn-kv";
import { DbConnKvHashMap } from "./db-conn-kv-impl-hash-map";
import { DbConnKvPostgres } from "./db-conn-kv-impl-postgres";
import { DbConnKvRedis } from "./db-conn-kv-impl-redis";
import { withCache } from "./with-cache";
import { withDistributedUpdates } from "./with-distributed-updates";
import { withNamespace } from "./with-namespace";
import { withReducedParsing } from "./with-reduced-parsing";
import { withThrottledWrites } from "./with-throttled-writes";

export type Impl =
	| {
			t: "hash-map";
			map?: Map<string, unknown>;
	  }
	| {
			t: "redis";
			url: string;
			logger: ILogger;
	  }
	| {
			t: "postgres";
			dbConnSql: IDbConnSql;
			logger: ILogger;
	  };

export const DbConnKv = async (impl: Impl): Promise<IDbConnKv> => {
	switch (impl.t) {
		case "hash-map": {
			return DbConnKvHashMap({
				map: impl.map,
			});
		}

		case "redis": {
			return DbConnKvRedis({
				url: impl.url,
				logger: impl.logger,
			});
		}

		case "postgres": {
			return DbConnKvPostgres({
				dbConn: impl.dbConnSql,
				logger: impl.logger,
			});
		}
	}
};

DbConnKv.withCache = withCache;
DbConnKv.withReducedParsing = withReducedParsing;
DbConnKv.withThrottledWrites = withThrottledWrites;
DbConnKv.withDistributedUpdates = withDistributedUpdates;
DbConnKv.withNamespace = withNamespace;
