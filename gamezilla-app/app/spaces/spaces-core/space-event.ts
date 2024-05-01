import { SpaceId, UserId } from "gamezilla-app/app/@/data";
import { p } from "gamezilla-app/@/core/parser";
import * as Game from "../game/game.core";

export const SpaceEvent = p.or(
	p.obj({
		t: p.l("user-started-space"),
		userId: UserId,
		spaceId: SpaceId,
	}),
	p.obj({
		t: p.l("user-ended-space"),
		userId: UserId,
		spaceId: SpaceId,
	}),
	p.obj({
		t: p.l("user-joined-space"),
		userId: UserId,
		spaceId: SpaceId,
	}),
	p.obj({
		t: p.l("user-left-space"),
		userId: UserId,
		spaceId: SpaceId,
	}),
	p.obj({
		t: p.l("user-inputted-game"),
		userId: UserId,
		spaceId: SpaceId,
		game: p.maybe(Game.GameName),
	}),
	p.obj({
		t: p.l("game"),
		spaceId: SpaceId,
		c: Game.MsgSync,
	}),
);

export type SpaceEvent = p.Infer<typeof SpaceEvent>;
