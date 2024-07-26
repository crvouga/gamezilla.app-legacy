import {p} from 'gamezilla-app/@/core/parser';
import type {GameCoreModule} from 'gamezilla-app/app/spaces/@/architecture/game-core';
import type {SpaceCtx} from 'gamezilla-app/app/spaces/@/space';
import {FlowPack} from '../../@/flow-pack';
import {FlowPuzzle} from '../../@/flow-puzzle';
import {FlowPlay} from '../../@/flow/flow-play';
import {FlowGroupId} from '../../@/flow/flow/flow-group-id';
import {CopyPuzzleTypes} from './copy-puzzle';

export const MsgCore = p.or(
	CopyPuzzleTypes.MsgCore,
	p.obj({
		t: p.l('flow-variant-play'),
		c: FlowPlay.Msg,
	}),
	p.obj({
		t: p.l('user-clicked-exit-puzzle'),
	}),
	p.obj({
		t: p.l('user-clicked-next-puzzle'),
		nextPuzzle: FlowPuzzle,
		nextPuzzleIndex: p.num,
	}),
	p.obj({
		t: p.l('user-clicked-prev-puzzle'),
		prevPuzzle: FlowPuzzle,
		prevPuzzleIndex: p.num,
	}),
	p.obj({
		t: p.l('user-closed-puzzle-complete-dialog'),
	}),
	p.obj({
		t: p.l('user-clicked-select-next-pack'),
	}),
	p.obj({
		t: p.l('user-clicked-reset-puzzle'),
	}),
	p.obj({
		t: p.l('user-clicked-hint'),
	}),
	p.obj({
		t: p.l('user-toggled-action-buttons-drawer'),
	}),
);

export type MsgCore = p.Infer<typeof MsgCore>;

// export const State = p.or(
// 	p.obj({
// 		t: p.l("solving"),
// 	}),
// 	p.obj({
// 		t: p.l("solved"),
// 	}),
// );
// export type State = p.Infer<typeof State>;

export const ModelCore = p.obj({
	t: p.l('screen-play-puzzle'),
	flowPack: FlowPack,
	flowPuzzle: FlowPuzzle,
	flowPlay: FlowPlay.Model,
	puzzleIndex: p.num,
	// state: State,
	opened: p.or(
		p.l('puzzle-complete'),
		p.l('action-drawer'),
		p.l(null),
	),
	hints: p.partialDict(FlowGroupId, FlowGroupId),
});

export type ModelCore = p.Infer<typeof ModelCore>;

export type CoreModule = GameCoreModule<{
	Ctx: SpaceCtx;
	ModelCore: ModelCore;
	MsgCore: MsgCore;
}>;
