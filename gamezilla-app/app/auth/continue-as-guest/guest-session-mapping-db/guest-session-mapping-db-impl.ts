import {IDbConnSql} from 'gamezilla-app/app/@/server/db-conn-sql';
import {IGuestSessionMappingDb} from './guest-session-mapping-db';
import {GuestSessionMappingDbHashMap} from './guest-session-mapping-db-impl-hash-map';
import {GuestSessionMappingDbPostgres} from './guest-session-mapping-db-impl-postgres';

type Impl =
	| {
			t: 'hash-map';
	  }
	| {
			t: 'postgres';
			dbConnSql: IDbConnSql;
	  };

export const GuestSessionMappingDb = (impl: Impl): IGuestSessionMappingDb => {
	switch (impl.t) {
		case 'hash-map': {
			return GuestSessionMappingDbHashMap();
		}

		case 'postgres': {
			return GuestSessionMappingDbPostgres(
				impl,
			);
		}
	}
};
