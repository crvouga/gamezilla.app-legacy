import type { Eff } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { APP_SOUND } from "gamezilla-app/app/@/client";
import type { FlowPuzzle } from "../../flow-puzzle/flow-puzzle";
import { FlowAlgoDrawPipes } from "../flow-aglo/flow-algo-draw-pipes";
import { FlowAlgoSolve } from "../flow-aglo/flow-algo-solve";
import { FlowHint } from "../flow-hint";
import type { FlowVariant } from "../flow-variant";
import * as Flow from "../flow/flow";
import * as FlowVariantUI from "../flow-variant/flow-variant-ui";

//
//
//
// Model
//
//
//

const Idle = p.obj({ t: p.l("idle") });
type Idle = p.Infer<typeof Idle>;

const Dragging = p.obj({
	t: p.l("dragging"),
	activeGroupId: Flow.GroupId,
	autocompleteEdge: p.maybe(Flow.Edge),
});
type Dragging = p.Infer<typeof Dragging>;

const Status = p.or(Idle, Dragging);
type Status = p.Infer<typeof Status>;

export const Model = p.and(
	FlowHint.Model,
	p.obj({
		pipesBySourceId: p.dict(Flow.NodeId, Flow.Pipe),
		terminalsByGroupId: p.partialDict(Flow.GroupId, Flow.Terminal),
		status: Status,
	}),
);
export type Model = p.Infer<typeof Model>;

export const init = (input: { flowPuzzle: FlowPuzzle }): Model => {
	return {
		...FlowHint.init(input),
		pipesBySourceId: { ...input.flowPuzzle.flow.pipesBySourceId },
		terminalsByGroupId: { ...input.flowPuzzle.flow.terminalsByGroupId },
		status: { t: "idle" },
	};
};

export const random = (input: { flowPuzzle: FlowPuzzle }): Model => {
	const initial = init(input);

	const terminal = Flow.randomTerminal(input.flowPuzzle.flow);

	if (!terminal) {
		return initial;
	}

	const edge = Flow.randomOutEdge(input.flowPuzzle.flow, terminal.startId);

	if (!edge) {
		return initial;
	}

	return {
		...initial,
		pipesBySourceId: {
			[terminal.startId]: {
				edgeId: Flow.toEdgeId(edge),
				groupId: terminal.groupId,
			},
		},
		terminalsByGroupId: {
			[terminal?.groupId]: terminal,
		},
	};
};

export const randomMsgs = ({ flow }: { flow: Flow.Model }): Msg[] => {
	const terminal = Flow.randomTerminal(flow);

	if (!terminal) {
		return [];
	}

	const edges: Flow.Edge[] = [];

	const currentNodeId: Flow.NodeId = terminal.startId;

	for (let i = 0; i < Math.random() * 10; i++) {
		const edge = Flow.randomOutEdge(flow, currentNodeId);

		if (!edge) {
			break;
		}

		edges.push(edge);
	}

	const msgs: Msg[] = [
		{
			t: "pressed-down",
			nodeId: terminal.startId,
		},
		...edges.map(
			(edge): Msg => ({
				t: "dragged-over",
				nodeId: edge.targetId,
			}),
		),
	];

	return msgs;
};

export const isShowingHint = (_model: Model): boolean => {
	return false;
};

export const toSolutionMsgs = ({
	flow,
}: {
	flow: FlowVariant.Model;
}): Msg[] => {
	const solutions = FlowAlgoSolve.solutions(flow);

	const solution = first(solutions);

	if (!solution) {
		return [];
	}

	const msgs: Msg[] = [];

	for (const terminal of Flow.toTerminals(solution)) {
		if (!terminal.endId) {
			continue;
		}

		msgs.push({
			t: "pressed-down",
			nodeId: terminal.startId,
		});

		for (const pipe of Flow.toPipeline(solution, terminal.startId)) {
			const edge = Flow.toEdge(solution, pipe.edgeId);
			if (!edge) {
				continue;
			}
			msgs.push({
				t: "dragged-over",
				nodeId: edge.targetId,
			});
		}

		msgs.push({
			t: "pressed-up",
			nodeId: terminal.endId,
		});
	}

	return msgs;
};

const first = <T,>(iterable: Iterable<T>): T | null => {
	for (const item of iterable) {
		return item;
	}
	return null;
};

//
//
//
//
//
//

export const Msg = p.or(
	FlowHint.Msg,
	p.obj({
		t: p.l("pressed-down"),
		nodeId: Flow.NodeId,
	}),
	p.obj({
		t: p.l("pressed-up"),
		nodeId: Flow.NodeId,
	}),
	p.obj({
		t: p.l("dragged-over"),
		nodeId: Flow.NodeId,
	}),
	p.obj({
		t: p.l("left"),
	}),
);

export type Msg = p.Infer<typeof Msg>;

export type Event =
	| FlowHint.Event
	| {
			t: "started-dragging";
	  }
	| {
			t: "connected-terminals";
			connectedTerminalCount: number;
	  }
	| {
			t: "solved";
	  };

export const eventToSoundSrc = (event: Event): string => {
	switch (event.t) {
		case "connected-terminals": {
			// return nthConnectedTerminal(event.connectedTerminalCount);
			return APP_SOUND.tap;
		}

		case "solved": {
			return APP_SOUND.celebration;
		}

		case "started-dragging": {
			return APP_SOUND.tap;
		}

		case "used-hint": {
			return APP_SOUND.navForwardMin;
		}
	}
};

export const update = ({
	msg,
	model,
	flowPuzzle,
}: {
	msg: Msg;
	model: Model;
	flowPuzzle: FlowPuzzle;
}): {
	model: Model;
	event?: Event;
	eff?: Eff<Msg>;
} => {
	const updated = updateMain({ msg, model, flowPuzzle });
	const updatedHint = FlowHint.update({
		model: updated.model,
		msg,
		flowPuzzle,
	});
	return {
		...updated,
		event: updatedHint.event ?? updated.event,
		model: updatedHint.model,
	};
};

const updateMain: typeof update = ({ model, flowPuzzle, msg }) => {
	switch (model.status.t) {
		case "dragging": {
			return updateDragging({
				flow: flowPuzzle.flow,
				msg,
				model,
				modelStatus: model.status,
			});
		}

		case "idle": {
			return updateIdle({ flowPuzzle, msg, model });
		}
	}
};

const updateIdle: typeof update = ({ msg, model, flowPuzzle }) => {
	switch (msg.t) {
		case "pressed-down": {
			const current = toFlow({ model, flow: flowPuzzle.flow });

			const groupId = Flow.toGroupId(current, msg.nodeId);

			if (!groupId) {
				return { model };
			}

			const started = FlowAlgoDrawPipes.startDrawPipes(
				current,
				groupId,
				msg.nodeId,
			);

			return {
				model: {
					...model,
					terminalsByGroupId: started.terminalsByGroupId,
					pipesBySourceId: started.pipesBySourceId,
					status: {
						t: "dragging",
						activeGroupId: groupId,
						autocompleteEdge: null,
					},
				},
				event: {
					t: "started-dragging",
				},
			};
		}

		default: {
			return { model };
		}
	}
};

const updateDragging = ({
	msg,
	modelStatus,
	model,
	flow,
}: {
	msg: Msg;
	model: Model;
	modelStatus: Dragging;
	flow: FlowVariant.Model;
}): {
	model: Model;
	event?: Event;
} => {
	switch (msg.t) {
		case "dragged-over": {
			const { nodeId } = msg;

			const current: FlowVariant.Model = {
				...flow,
				pipesBySourceId: model.pipesBySourceId,
				terminalsByGroupId: model.terminalsByGroupId,
			};

			const extended = FlowAlgoDrawPipes.drawPipes(
				current,
				modelStatus.activeGroupId,
				nodeId,
			);

			const modelNew: Model = {
				...model,
				status: model.status,
				terminalsByGroupId: extended.terminalsByGroupId,
				pipesBySourceId: extended.pipesBySourceId,
			};

			return { model: modelNew };
		}

		case "pressed-up": {
			const current = toFlow({ model, flow });
			const modelNew: Model = { ...model, status: { t: "idle" } };

			const activeGroupTerminal = Flow.toTerminalByGroupId(
				current,
				modelStatus.activeGroupId,
			);

			if (!activeGroupTerminal) {
				return { model: modelNew };
			}

			const isConnected = Flow.isConnectedWithPipes(
				current,
				activeGroupTerminal.startId,
				activeGroupTerminal.endId,
			);

			const isSolved = Flow.isSolved(current);

			if (isSolved && isConnected) {
				return {
					model: modelNew,
					event: {
						t: "solved",
					},
				};
			}

			if (isConnected) {
				return {
					model: modelNew,
					event: {
						t: "connected-terminals",
						connectedTerminalCount: Flow.countConnectedPipes(current),
					},
				};
			}

			return { model: modelNew };
		}

		case "left": {
			const current = toFlow({ model, flow });
			const isSolved = Flow.isSolved(current);

			const terminal = Flow.toTerminalByGroupId(
				current,
				modelStatus.activeGroupId,
			);

			if (!terminal?.endId) {
				return {
					model: {
						...model,
						status: {
							t: "idle",
						},
					},
				};
			}

			return {
				model: {
					...model,
					status: {
						t: "idle",
					},
				},
				event: isSolved
					? {
							t: "solved",
						}
					: undefined,
			};
		}

		default: {
			return { model };
		}
	}
};

export const toFlow = ({
	model,
	flow,
}: {
	flow: FlowVariant.Model;
	model: Model;
}): FlowVariant.Model => {
	const derived = FlowHint.deriveFlow({
		flow,
		model,
	});
	return {
		...derived,
		terminalsByGroupId: model.terminalsByGroupId,
	};
};

//
//
//
// View
//
//
//

export const View = (input: {
	flow: FlowVariant.Model;
	model: Model;
	dispatch: (m: Msg) => void;
	disabled?: boolean;
}) => {
	return (
		<FlowVariantUI.View
			disabled={input.disabled}
			model={toFlow(input)}
			showCoordinates={false}
			isDragging={input.model.status.t === "dragging"}
			onDraggedOver={(nodeId) => input.dispatch({ t: "dragged-over", nodeId })}
			onPressDown={(nodeId) => input.dispatch({ t: "pressed-down", nodeId })}
			onPressUp={(nodeId) => input.dispatch({ t: "pressed-up", nodeId })}
			onLeave={() => input.dispatch({ t: "left" })}
			autocompleteEdge={
				input.model.status.t === "dragging" &&
				input.model.status.autocompleteEdge
					? {
							...input.model.status.autocompleteEdge,
							groupId: input.model.status.activeGroupId,
						}
					: null
			}
			isGroupActive={(groupId) =>
				input.model.status.t === "dragging" &&
				input.model.status.activeGroupId === groupId
			}
			usedHints={input.model.usedHints}
		/>
	);
};

export const viewHintButtonAction = FlowHint.viewHintButtonAction;
