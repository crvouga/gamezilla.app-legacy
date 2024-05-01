import type { ISpacesDb } from "./space-db";
import * as ImplDbConnKv from "./space-db-impl-db-conn-kv";

export type SpacesDbImpl = ImplDbConnKv.Deps & {
	t: "db-conn-kv";
};

export const SpacesDb = (impl: SpacesDbImpl): ISpacesDb => {
	switch (impl.t) {
		case "db-conn-kv":
			return ImplDbConnKv.SpacesDb(impl);
	}
};
