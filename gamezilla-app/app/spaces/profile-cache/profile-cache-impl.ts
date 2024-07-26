import type {IDbConnKv} from 'gamezilla-app/app/@/server/db-conn-kv';
import {ProfileCacheDbKv} from './profile-cache-impl-db-kv';
import type {IProfileCache} from './profile-cache';

export type Impl = {t: 'db-conn-kv'; dbConnKv: IDbConnKv};

export const ProfileCache = (impl: Impl): IProfileCache => {
	switch (impl.t) {
		case 'db-conn-kv':
			return ProfileCacheDbKv(impl);
	}
};
