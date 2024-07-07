import { p } from "gamezilla-app/@/core/parser";
import { UserId } from "gamezilla-app/app/@/data";

export const MsgCore = p.or(
	p.obj({
		t: p.l("user-clicked-start-game"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("user-added-bot-player"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("user-removed-bot-player"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("user-started-playing"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("user-stopped-playing"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("user-removed-user-player"),
		userId: UserId,
	}),
);

const Player = p.or(
	p.obj({
		t: p.l("user"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("bot"),
	}),
);

export const ModelCore = p.obj({
	players: p.arr(Player),
});

export type ModelCore = p.Infer<typeof ModelCore>;
