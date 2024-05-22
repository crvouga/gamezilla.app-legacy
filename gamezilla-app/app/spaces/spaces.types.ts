import type { RequestResponse } from "gamezilla-app/@/core";
import type { Profile, SpaceId, UserId } from "gamezilla-app/app/@/data";
import type { AppClientModule } from "../@/architecture/app-client";
import type { AppServerModule } from "../@/architecture/app-server";
import type {
	AnonymousClientCtx,
	ClientCmd,
	ClientCtx,
	ClientEvent,
} from "../@/client";
import type { ServerCmd, ServerCtx, ServerEvent } from "../@/server";
import type { WithEventId, WithEventMeta } from "./@/event";
import type * as Game from "./game/game.types";
import type { IProfileCache } from "./profile-cache";
import type { IGameDb } from "./space-game/space-game-db";
import type * as Space from "./spaces-core/space";
import type { ISpacesDb } from "./spaces-core/space-db";
import type { SpaceEvent } from "./spaces-core/space-event";
import type * as Spaces from "./spaces-core/spaces-core.client";

//
//
//
//
//
//
//
//

export type ClientModule = AppClientModule<{
	Ctx: AnonymousClientCtx | ClientCtx;
	MsgCmdIn: never;
	MsgEvtIn: ClientEvent;
	Model: ModelClient;
	Msg: MsgClient;
	MsgCmdOut: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>;
	MsgEvtOut: ClientEvent;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	ViewSlot: {
		bottomBar: null;
	};
}>;

export type ServerModule = AppServerModule<{
	Ctx: ServerCtx;
	MsgCmdIn: null;
	MsgEvtIn: ServerEvent;
	Model: ModelServer;
	Msg: MsgServer;
	MsgCmdOut: ServerCmd<MsgToClient>;
	MsgEvtOut: null;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	Deps: ServerDeps;
}>;

export type ServerDeps = {
	ProfileCache: IProfileCache;
	SpacesDb: ISpacesDb;
	GameDb: IGameDb;
};

//
//
//
// Model
//
//
//

export type ModelServer = null;

export type ModelClient = Spaces.Model & {
	games: {
		[spaceId: SpaceId]: Game.ModelClient;
	};
	modalPreviewUserId: UserId | null;
	modal: null | "user-preview" | "users";
	listSpacesRequest: RequestResponse<string, null>;
};


//
//
//
// Msg
//
//
//

export type MsgServer =
	| { t: "event"; c: WithEventId<SpaceEvent> }
	| { t: "game"; spaceId: SpaceId; c: Game.MsgServer };

export type MsgClient =
	| { t: "game"; spaceId: SpaceId; c: Game.MsgClient }
	| { t: "time-passed" }
	| { t: "clicked-go-home-button" }
	| { t: "clicked-game-tile"; gameName: Game.GameName }
	| { t: "clicked-join-space-button"; spaceId: SpaceId }
	| { t: "clicked-end-space-button" }
	| { t: "clicked-leave-space-button" }
	| { t: "clicked-start-space-button"; spaceId: SpaceId }
	| { t: "closed-modal" }
	| { t: "clicked-people-button" }
	| { t: "clicked-space-card"; spaceId: SpaceId }
	| { t: "clicked-user"; userId: UserId }
	| { t: "clicked-preview-user-link" }
	| { t: "clicked-current-space-bottom-bar" };

export type MsgToClient = MsgToClientExtra &
	(
		| {
				t: "event";
				c: WithEventMeta<SpaceEvent>;
		  }
		| {
				t: "listed-spaces";
				spaces: Space.Model[];
		  }
		| {
				t: "synced";
				space: Space.Model;
		  }
		| {
				t: "current-user-space";
				space: Space.Model;
		  }
		| {
				t: "game";
				spaceId: SpaceId;
				c: Game.MsgToClient;
		  }
	);

export type MsgToServer = MsgToServerExtra &
	(
		| {
				t: "event";
				c: WithEventMeta<SpaceEvent>;
		  }
		| {
				t: "sync";
				space: Space.Model;
		  }
		| {
				t: "list-spaces";
				limit: number;
				offset: number;
				where?: {
					spaceId?: SpaceId;
				};
		  }
		| {
				t: "game";
				spaceId: SpaceId;
				c: Game.MsgToServer;
		  }
	);

export type MsgToClientExtra = {
	profiles?: { [userId: UserId]: Profile };
	causedBy?: unknown;
	meta?: Record<string, unknown>;
};

export type MsgToServerExtra = {
	profiles?: { [userId: UserId]: Profile };
	meta?: Record<string, unknown>;
	causedBy?: unknown;
};
