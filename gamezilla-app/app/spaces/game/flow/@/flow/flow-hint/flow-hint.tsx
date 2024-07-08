import { p } from "gamezilla-app/@/core/parser";
import type { ClientCtx } from "gamezilla-app/app/@/client";
import { IconLightbulb } from "gamezilla-app/app/@/ui";
import type { ActionProps } from "gamezilla-app/app/@/ui/actions";
import type { FlowPuzzle } from "../../flow-puzzle/flow-puzzle";
import { Flow } from "../flow";
import { FlowVariant } from "..";
import { FlowGroupId } from "../flow/flow-group-id";
import { FlowNodeId } from "../flow/flow-node-id";
import { FlowTerminal } from "../flow/flow-terminal";
import { FlowAlgoSolve } from "../flow-aglo/flow-algo-solve";

export const Model = p.obj({
	pipesBySourceId: p.dict(FlowNodeId, Flow.Pipe),
	terminalsByGroupId: p.partialDict(FlowGroupId, FlowTerminal),
	usedHints: p.partialDict(FlowGroupId, FlowGroupId),
});
export type Model = p.Infer<typeof Model>;

export const Msg = p.or(
	p.obj({
		t: p.l("user-clicked-hint"),
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
			const flow = toFlow({
				flow: input.flowPuzzle.flow,
				model: input.model,
			});

			const nextHintGroupId = toNextHintGroupId(flow);

			if (!nextHintGroupId) {
				return { model: input.model };
			}

			const solution =
				input.flowPuzzle.flowSolutions.length > 0
					? input.flowPuzzle.flowSolutions[0]
					: FlowAlgoSolve.solve(flow);

			if (!solution) {
				return { model: input.model };
			}

			const solutionPipeline = Flow.toPipelineFromGroupId(
				solution,
				nextHintGroupId,
			);

			const solutionTerminal = Flow.toTerminalByGroupId(
				solution,
				nextHintGroupId,
			);

			const addedSolution = Flow.addPipeline(flow, solutionPipeline);

			const modelNew: TModel = {
				...input.model,
				pipesBySourceId: addedSolution.pipesBySourceId,
				terminalsByGroupId: {
					...input.model.terminalsByGroupId,
					[nextHintGroupId]:
						solutionTerminal ?? input.model.terminalsByGroupId[nextHintGroupId],
				},
				usedHints: {
					...input.model.usedHints,
					[nextHintGroupId]: nextHintGroupId,
				},
			};

			const flowNew = toFlow({ flow, model: modelNew });

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

export const toNextHintGroupId = (model: Flow.Model): FlowGroupId | null => {
	for (const groupId of FlowGroupId.ORDER) {
		if (!Flow.isTerminalConnectedWithPipes(model, groupId)) {
			return groupId;
		}
	}
	return null;
};

export const toShowingHintGroupIds = (model: Model): FlowGroupId[] => {
	return Object.keys(model.usedHints).map((k) => k as FlowGroupId);
};

export const isAnyShowingHint = (model: Model): boolean => {
	return toShowingHintGroupIds(model).length > 0;
};

export const resetUsedHints = <TModel extends Model>(model: TModel): TModel => {
	return {
		...model,
		usedHints: {},
	};
};

export const toUsedHints = (
	model: Model,
): {
	[flowGroupId in FlowGroupId]?: FlowGroupId;
} => {
	return model.usedHints;
};

export const toFlow = (input: {
	model: Model;
	flow: FlowVariant.Model;
}): FlowVariant.Model => {
	return {
		...input.flow,
		pipesBySourceId: input.model.pipesBySourceId,
		terminalsByGroupId: input.model.terminalsByGroupId,
	};
};

export const viewHintAction = (input: {
	flowPuzzle: FlowPuzzle;
	model: Model;
	dispatch: (msg: Msg) => void;
	ctx: ClientCtx;
}): ActionProps => {
	const flow = toFlow({
		flow: input.flowPuzzle.flow,
		model: input.model,
	});
	const disabled = Flow.isSolved(flow);
	return {
		icon: (props) => <IconLightbulb {...props} />,
		label: input.ctx.t("game.hint"),
		onClick: () => input.dispatch({ t: "user-clicked-hint" }),
		disabled,
	};
};
