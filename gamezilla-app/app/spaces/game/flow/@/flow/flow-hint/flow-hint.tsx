import { p } from "gamezilla-app/@/core/parser";
import type { ClientCtx } from "gamezilla-app/app/@/client";
import { IconLightbulb } from "gamezilla-app/app/@/ui";
import type { ButtonActionProps } from "gamezilla-app/app/@/ui/bottom-actions";
import type { FlowPuzzle } from "../../flow-puzzle/flow-puzzle";
import { Flow } from "../flow";
import { FlowVariant } from "..";

export const Model = p.obj({
	pipesBySourceId: p.dict(Flow.NodeId, Flow.Pipe),
	terminalsByGroupId: p.partialDict(Flow.GroupId, Flow.Terminal),
	usedHints: p.partialDict(Flow.GroupId, Flow.GroupId),
});
export type Model = p.Infer<typeof Model>;

export const Msg = p.or(
	p.obj({
		t: p.l("user-clicked-hint"),
	}),
	p.obj({
		t: p.l("found-solution"),
		model: p.maybe(FlowVariant.Model),
	}),
);
export type Msg = p.Infer<typeof Msg>;

export const init = (input: { flowPuzzle: FlowPuzzle }): Model => {
	return {
		pipesBySourceId: {},
		usedHints: {},
		terminalsByGroupId: input.flowPuzzle.flow.terminalsByGroupId,
	};
};

export type Event =
	| {
			t: "solved";
	  }
	| {
			t: "used-hint";
	  };

export const update = <
	TModel extends Model,
	TMsg extends { t: string & {} },
>(input: {
	msg: Msg | TMsg;
	model: TModel;
	flowPuzzle: FlowPuzzle;
}): {
	model: TModel;
	event?: Event;
} => {
	switch (input.msg.t) {
		case "user-clicked-hint": {
			const flow = deriveFlow({
				flow: input.flowPuzzle.flow,
				model: input.model,
			});

			const nextHintGroupId = toNextHintGroupId(flow);

			if (!nextHintGroupId) {
				return { model: input.model };
			}

			const solution = input.flowPuzzle.flowSolutions[0];

			if (!solution) {
				return { model: input.model };
			}

			const removed = Flow.removePipeline(flow, nextHintGroupId);

			const pipeline = Flow.toPipelineByGroupId(solution, nextHintGroupId);

			const pipesBySourceId = Flow.pipelineToPipesBySourceId(removed, pipeline);

			const terminal = Flow.toTerminalByGroupId(solution, nextHintGroupId);

			const modelNew: TModel = {
				...input.model,
				pipesBySourceId: {
					...removed.pipesBySourceId,
					...pipesBySourceId,
				},
				terminalsByGroupId: {
					...input.model.terminalsByGroupId,
					[nextHintGroupId]:
						terminal ?? input.model.terminalsByGroupId[nextHintGroupId],
				},
				usedHints: {
					...input.model.usedHints,
					[nextHintGroupId]: nextHintGroupId,
				},
			};

			const flowNew = deriveFlow({ flow, model: modelNew });

			if (Flow.isSolved(flowNew)) {
				return {
					model: modelNew,
					event: {
						t: "solved",
					},
				};
			}

			return {
				model: modelNew,
				event: {
					t: "used-hint",
				},
			};
		}

		default: {
			return { model: input.model };
		}
	}
};

export const toNextHintGroupId = (model: Flow.Model): Flow.GroupId | null => {
	for (const groupId of Flow.GROUP_ID_ORDER) {
		if (!Flow.isTerminalConnectedWithPipes(model, groupId)) {
			return groupId;
		}
	}
	return null;
};

export const toShowingHintGroupIds = (model: Model): Flow.GroupId[] => {
	return Object.keys(model.usedHints).map((k) => k as Flow.GroupId);
};

export const isAnyShowingHint = (model: Model): boolean => {
	return toShowingHintGroupIds(model).length > 0;
};

export const deriveFlow = (input: {
	model: Model;
	flow: FlowVariant.Model;
}): FlowVariant.Model => {
	return {
		...input.flow,
		pipesBySourceId: input.model.pipesBySourceId,
		terminalsByGroupId: input.model.terminalsByGroupId,
	};
};
export const viewHintButtonAction = (input: {
	flowPuzzle: FlowPuzzle;
	model: Model;
	dispatch: (msg: Msg) => void;
	ctx: ClientCtx;
}): ButtonActionProps => {
	return {
		icon: (props) => <IconLightbulb {...props} />,
		label: input.ctx.t("game.hint"),
		onClick: () => input.dispatch({ t: "user-clicked-hint" }),
		disabled: input.flowPuzzle.flowSolutions.length === 0,
	};
};
