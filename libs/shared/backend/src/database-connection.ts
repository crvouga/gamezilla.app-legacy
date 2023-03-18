import { Result } from '@gamezilla/core';
import { Pool } from 'pg';

export type ParserMyZodEsque<TInput> = {
  parse: (input: unknown) => TInput;
};

export type DatabaseConnection = {
  query: <TRow>(
    rowParser: ParserMyZodEsque<TRow>,
    text: string
  ) => Promise<Result<string, TRow[]>>;
};

const create = (): DatabaseConnection => {
  const pool = new Pool();

  return {
    query: async (rowParser, text) => {
      try {
        const start = Date.now();
        const queried = await pool.query(text);
        const parsed = queried.rows.map(rowParser.parse);
        const duration = Date.now() - start;
        console.log('executed query', {
          text,
          duration,
          rows: queried.rowCount,
        });
        return Result.Ok(parsed);
      } catch (error) {
        console.log('error executing query', { text, error });
        return Result.Err(String(error));
      }
    },
  };
};

export const DatabaseConnection = {
  create,
};
