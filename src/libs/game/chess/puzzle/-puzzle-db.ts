import { Err, Result, Task } from "@gamezilla/shared/core";
import { DbReq } from "./puzzle.shared";
import { Model } from "./puzzle.server";
import { DbConnMySql } from "@gamezilla/shared/server";
import { z } from "zod";

export const handle =
  ({
    msg,
    dbConn,
  }: {
    model: Model;
    msg: DbReq;
    dbConn: DbConnMySql;
  }): Task<Result<string, Model>> =>
  async () => {
    if (msg.t === "db-get") {
      await dbConn.query(z.object({}), "SELECT * FROM puzzle_profile");
    }
    return Err("Not implemented");
  };
