import { Result } from '@gamezilla/shared/core';
import { Pool } from 'pg';
import { ParserMyZodEsque } from './shared';

export type DatabaseConnectionPostgres = {
  query: <TRow>(
    rowParser: ParserMyZodEsque<TRow>,
    text: string,
    params?: unknown[]
  ) => Promise<Result<string, TRow[]>>;
};

const debugging = false;

const log = (...args: unknown[]) => {
  if (debugging) {
    console.log(...args);
  }
};

const create = ({
  connectionString,
}: {
  connectionString: string;
}): DatabaseConnectionPostgres => {
  const pool = new Pool({
    connectionString,
  });

  return {
    query: async (rowParser, text, values) => {
      try {
        const queried = await pool.query(text, values);
        const parsed = queried.rows.map(rowParser.parse, values);
        log('executed query', {
          text,
          values,
          rows: queried.rowCount,
        });
        return Result.Ok(parsed);
      } catch (error) {
        log('error executing query', { text, error });
        console.log(error);
        return Result.Err(String(error));
      }
    },
  };
};

export const DatabaseConnectionPostgres = {
  create,
};
