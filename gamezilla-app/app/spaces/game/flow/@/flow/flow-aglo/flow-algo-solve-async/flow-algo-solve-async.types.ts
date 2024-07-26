import {p} from 'gamezilla-app/@/core/parser';
import {FlowVariant} from '../../flow-variant';

export const MsgToWorker = p.or(
	p.obj({
		t: p.l('find-solution'),
		model: FlowVariant.Model,
	}),
);
export type MsgToWorker = p.Infer<typeof MsgToWorker>;

export const MsgToMaster = p.or(
	p.obj({
		t: p.l('found-solution'),
		model: p.maybe(FlowVariant.Model),
	}),
);
export type MsgToMaster = p.Infer<typeof MsgToMaster>;
