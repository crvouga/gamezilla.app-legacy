import { Result } from '@gamezilla/core';
import * as mysql from 'mysql2/promise';
import { ParserMyZodEsque } from './shared';

export type DatabaseConnectionMySQL = {
  query: <TRow>(
    rowParser: ParserMyZodEsque<TRow>,
    text: string,
    params?: unknown[]
  ) => Promise<Result<string, TRow[]>>;
};

const debugging = true;

const log = (...args: unknown[]) => {
  if (debugging) {
    console.log(...args);
  }
};

const create = async ({
  connectionString,
}: {
  connectionString: string;
}): Promise<DatabaseConnectionMySQL> => {
  const connection = await mysql.createConnection(connectionString);

  return {
    query: async (rowParser, text, values) => {
      try {
        const [rows, fields] = await connection.query(text, values);

        const parsed = Array.isArray(rows)
          ? rows.map(rowParser.parse, values)
          : [];
        log('executed query', {
          text,
          fields,
          values,
        });
        return Result.Ok(parsed);
      } catch (error) {
        log('error executing query', { text, error });
        console.log(String(error));
        return Result.Err(String(error));
      }
    },
  };
};

export const DatabaseConnectionMySQL = {
  create,
};
