import { Result } from "gamezilla/@/core";

export type DbConnSql = {
  query: <TRow>(
    isRow: (row: unknown) => row is TRow,
    rawSql: string,
    params?: unknown[]
  ) => Promise<Result<string, TRow[]>>;
};
