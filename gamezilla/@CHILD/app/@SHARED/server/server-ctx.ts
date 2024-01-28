import { Posix } from "gamezilla/@SHARED/core";
import { DbConnSql } from "./db-conn-sql-interface";
import { Logger } from "./logger";

export type ServerCtx = {
  dbConn: DbConnSql;
  now: Posix;
  logger: Logger;
};
