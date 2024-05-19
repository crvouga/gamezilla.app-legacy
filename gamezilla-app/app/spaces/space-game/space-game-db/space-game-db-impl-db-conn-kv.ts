import type { SpaceId } from "gamezilla-app/app/@/data";
import { DbConnKv, IDbConnKv } from "gamezilla-app/app/@/server/db-conn-kv";
import * as Game from "../../game/game.types";
import type { IGameDb } from "./space-game-db";

const GameDb = ({ dbConnKv }: { dbConnKv: IDbConnKv }): IGameDb => {
	const bySpaceId = DbConnKv.withNamespace<SpaceId, Game.ModelServer>(
		dbConnKv,
		["game", "game-by-id"],
		Game.ModelServer,
	);

	return {
		async getBySpaceId(spaceId) {
			return bySpaceId.get(spaceId);
		},
		async upsert(spaceId, game) {
			return bySpaceId.set(spaceId, game);
		},
	};
};

export const ImplDbConnKv = {
	GameDb,
};
