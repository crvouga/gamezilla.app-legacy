import { p } from "gamezilla-app/@/core/parser";
import { Flow, FlowAlgoSolve } from "../flow";
import { FlowVariant } from ".";
import { ViewBottomButtonBarActionHint } from "gamezilla-app/app/spaces/game/@/game";
import { ClientCtx } from "gamezilla-app/app/@/client";

export const Model = p.obj({
	pipesBySourceId: p.partialDict(Flow.NodeId, Flow.Pipe),
	hints: p.partialDict(Flow.GroupId, Flow.GroupId),
});
export type Model = p.Infer<typeof Model>;

export const Msg = p.obj({
	t: p.l("user-clicked-hint-button"),
});
export type Msg = p.Infer<typeof Msg>;

export const init: Model = {
	pipesBySourceId: {},
	hints: {},
};

export const update = <TModel extends Model,>({
	msg,
	model,
	flow,
}: {
	msg: Msg;
	model: TModel;
	flow: FlowVariant.Model;
}): {
	model: TModel;
} => {
	switch (msg.t) {
		case "user-clicked-hint-button": {
			const nextHintGroupId = toNextHintGroupId(flow);

			if (!nextHintGroupId) {
				return { model };
			}
			const solutions = FlowAlgoSolve.solve(flow, {
				distance: FlowVariant.distance(flow),
			});
			const solution = next(solutions);
			if (!solution) {
				return { model };
			}
			const pipeline = Flow.toPipelineByGroupId(solution, nextHintGroupId);
			const pipesBySourceId = Flow.pipelineToPipsBySourceId(flow, pipeline);

			const modelNew: TModel = {
				...model,
				pipesBySourceId: {
					...model.pipesBySourceId,
					...pipesBySourceId,
				},
				hints: {
					...model.hints,
					[nextHintGroupId]: nextHintGroupId,
				},
			};
			return {
				model: modelNew,
			};
		}
		default: {
			return { model };
		}
	}
};

const toNextHintGroupId = (model: Flow.Model): Flow.GroupId | null => {
	for (const groupId of Flow.GROUP_ID_ORDER) {
		if (!Flow.isTerminalConnectedWithPipes(model, groupId)) {
			return groupId;
		}
	}
	return null;
};

const toShowingHintGroupIds = (model: Model): Flow.GroupId[] => {
	return Object.keys(model.hints).map((k) => k as Flow.GroupId);
};

export const isAnyShowingHint = (model: Model): boolean => {
	return toShowingHintGroupIds(model).length > 0;
};

const next = <T,>(iter: Iterable<T>): T | null => {
	for (const t of iter) {
		return t;
	}
	return null;
};

export const ViewBottomButtonBarAction = (input: {
	model: Model;
	dispatch: (msg: Msg) => void;
	ctx: ClientCtx;
}) => {
	return (
		<ViewBottomButtonBarActionHint
			ctx={input.ctx}
			onClick={() =>
				input.dispatch({
					t: "user-clicked-hint-button",
				})
			}
		/>
	);
};
