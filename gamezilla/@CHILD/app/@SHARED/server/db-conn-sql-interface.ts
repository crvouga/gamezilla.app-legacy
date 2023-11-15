import { Result } from "gamezilla/@SHARED/core";

export type DbConnSql = {
  query: <TRow>(
    isRow: (row: unknown) => row is TRow,
    rawSql: string,
    params: { [key: string]: number | string | boolean | null | undefined }
  ) => Promise<Result<string, TRow[]>>;
};
