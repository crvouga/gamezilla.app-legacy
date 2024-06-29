import { Eff } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import type { ClientCtx } from "gamezilla-app/app/@/client";
import { ViewBottomButtonBarActionHint } from "gamezilla-app/app/spaces/game/@/game";
import { Flow } from "../flow";
import * as FlowVariant from "./flow-variant";
import { FlowAlgoSolveAsync } from "./flow-variant-aglo/flow-algo-solve-async";

export const Model = p.obj({
	pipesBySourceId: p.dict(Flow.NodeId, Flow.Pipe),
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

export const init: Model = {
	pipesBySourceId: {},
	usedHints: {},
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
	flow: FlowVariant.Model;
}): {
	model: TModel;
	event?: Event;
	eff?: Eff<Msg>;
} => {
	switch (input.msg.t) {
		case "user-clicked-hint": {
			const flow = deriveFlow(input);

			return {
				model: input.model,
				async eff(dispatch) {
					dispatch({
						t: "found-solution",
						model: await FlowAlgoSolveAsync.solve(flow),
					});
				},
			};
		}

		case "found-solution": {
			const flow = deriveFlow(input);

			const nextHintGroupId = toNextHintGroupId(flow);

			if (!nextHintGroupId) {
				return { model: input.model };
			}

			const solution =
				input.msg.t === "found-solution"
					? // @ts-ignore
						input.msg.model
					: null;

			if (!solution) {
				return { model: input.model };
			}
			const pipeline = Flow.toPipelineByGroupId(solution, nextHintGroupId);
			const pipesBySourceId = Flow.pipelineToPipsBySourceId(flow, pipeline);

			const modelNew: TModel = {
				...input.model,
				pipesBySourceId: {
					...input.model.pipesBySourceId,
					...pipesBySourceId,
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
	};
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
					t: "user-clicked-hint",
				})
			}
		/>
	);
};
