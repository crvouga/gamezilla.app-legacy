import { p } from "gamezilla-app/@/core/parser";
import { Flow, FlowVariantUIPlay } from "../../@/flow";
import { FlowPack } from "../../@/flow-pack";
import { FlowPuzzle } from "../../@/flow-puzzle";

export const MsgCore = p.or(
	p.obj({
		t: p.l("got-puzzle-screen-flow-play-msg"),
		c: FlowVariantUIPlay.Msg,
	}),
	p.obj({
		t: p.l("user-clicked-exit-puzzle-button"),
	}),
	p.obj({
		t: p.l("user-clicked-next-puzzle-button"),
		nextPuzzle: FlowPuzzle,
		nextPuzzleIndex: p.num,
	}),
	p.obj({
		t: p.l("user-clicked-prev-puzzle-button"),
		prevPuzzle: FlowPuzzle,
		prevPuzzleIndex: p.num,
	}),
	p.obj({
		t: p.l("user-closed-puzzle-complete-dialog"),
	}),
	p.obj({
		t: p.l("user-clicked-select-next-pack-button"),
	}),
	p.obj({
		t: p.l("user-clicked-reset-puzzle-button"),
	}),
	p.obj({
		t: p.l("user-clicked-hint-button"),
	}),
);

export type MsgCore = p.Infer<typeof MsgCore>;

export const State = p.or(
	p.obj({
		t: p.l("solving"),
	}),
	p.obj({
		t: p.l("solved"),
	}),
);
export type State = p.Infer<typeof State>;

export const ModelCore = p.obj({
	t: p.l("screen-play-puzzle"),
	flowPack: FlowPack,
	flowPuzzle: FlowPuzzle,
	flowPlay: FlowVariantUIPlay.Model,
	puzzleIndex: p.num,
	state: State,
	opened: p.or(p.l("puzzle-complete"), p.l(null)),
	hints: p.partialDict(Flow.GroupId, Flow.GroupId),
});

export type ModelCore = p.Infer<typeof ModelCore>;
