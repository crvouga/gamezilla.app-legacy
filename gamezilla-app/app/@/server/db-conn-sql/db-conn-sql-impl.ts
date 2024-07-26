import {Ok} from 'gamezilla-app/@/core';
import type {ILogger} from '../logger/logger';
import type {IDbConnSql} from './db-conn-sql';
import {DbConnPostgres} from './db-conn-sql-impl-postgres';

type DbConnSqlImpl =
	| {
			t: 'postgres';
			databaseUrl: string;
			logger: ILogger;
	  }
	| {
			t: 'noop';
	  };

export const DbConnSql = async (impl: DbConnSqlImpl): Promise<IDbConnSql> => {
	switch (impl.t) {
		case 'noop': {
			return DbConnSqlNoop();
		}
		case 'postgres': {
			return DbConnPostgres(impl);
		}
	}
};

export const DbConnSqlNoop = (): IDbConnSql => {
	return {
		async query() {
			return Ok([]);
		},
		async onNotification() {
			return () => {};
		},
	};
};
