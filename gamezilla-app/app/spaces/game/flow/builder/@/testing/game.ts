import type {WithEventId} from 'gamezilla-app/app/spaces/@/event';
import type {FlowClientCtx} from '../../../@/flow-ctx';
import type {MsgCore} from '../../builder.types';
import {BuilderCore} from '../../builder.core';

export const deriveModelCore =
	(ctx: FlowClientCtx) =>
	(input: {msgCore?: WithEventId<MsgCore>[]}) => {
		return (input.msgCore ?? []).reduce(
			(modelCore, msgCore) =>
				BuilderCore.updateCore(
					{
						modelCore,
						msgCore,
						ctx,
					},
				),
			BuilderCore.initCore({
				ctx,
			}),
		);
	};
