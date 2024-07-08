import { pipe, TimeSpan } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { Translator } from "gamezilla-app/@/l18n/generated";
import { APP_SOUND } from "gamezilla-app/app/@/client";
import { IconCheckmark, Transition } from "gamezilla-app/app/@/ui";
import { ActionProps, Actions } from "gamezilla-app/app/@/ui/actions";
import type { FlowPuzzle } from "../../flow-puzzle/flow-puzzle";
import { FlowAlgoDrawPipes } from "../flow-aglo/flow-algo-draw-pipes";
import { FlowAlgoSolve } from "../flow-aglo/flow-algo-solve";
import { FlowHint } from "../flow-hint";
import type { FlowVariant } from "../flow-variant";
import * as FlowVariantUI from "../flow-variant/flow-variant-ui";
import * as Flow from "../flow/flow";
import { FlowGroupId } from "../flow/flow-group-id";
import { FlowNodeId } from "../flow/flow-node-id";
import { FlowTerminal } from "../flow/flow-terminal";

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
	activeGroupId: FlowGroupId,
	autocompleteEdge: p.maybe(Flow.Edge),
});
type Dragging = p.Infer<typeof Dragging>;

const Status = p.or(Idle, Dragging);
type Status = p.Infer<typeof Status>;

export const Model = p.and(
	FlowHint.Model,
	p.obj({
		pipesBySourceId: p.dict(FlowNodeId, Flow.Pipe),
		terminalsByGroupId: p.partialDict(FlowGroupId, FlowTerminal),
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
				edgeId: Flow.toFlowEdgeId(edge),
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

	const currentNodeId: FlowNodeId = terminal.startId;

	for (let i = 0; i < Math.random() * 10; i++) {
		const edge = Flow.randomOutEdge(flow, currentNodeId);

		if (!edge) {
			break;
		}

		edges.push(edge);
	}

	const msgs: Msg[] = [
		{
			t: "user-pressed-down-node",
			nodeId: terminal.startId,
		},
		...edges.map(
			(edge): Msg => ({
				t: "user-dragged-over-node",
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
			t: "user-pressed-down-node",
			nodeId: terminal.startId,
		});

		for (const pipe of Flow.toPipeline(solution, terminal.startId)) {
			const edge = Flow.toEdge(solution, pipe.edgeId);
			if (!edge) {
				continue;
			}
			msgs.push({
				t: "user-dragged-over-node",
				nodeId: edge.targetId,
			});
		}

		msgs.push({
			t: "user-pressed-up-node",
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
		t: p.l("user-clicked-reset"),
	}),
	p.obj({
		t: p.l("user-pressed-down-node"),
		nodeId: FlowNodeId,
	}),
	p.obj({
		t: p.l("user-pressed-up-node"),
		nodeId: FlowNodeId,
	}),
	p.obj({
		t: p.l("user-dragged-over-node"),
		nodeId: FlowNodeId,
	}),
	p.obj({
		t: p.l("user-dragging-left"),
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
	  }
	| {
			t: "resetted";
	  };

export const eventToSoundSrc = (event: Event): string => {
	switch (event.t) {
		case "connected-terminals": {
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

		case "resetted": {
			return APP_SOUND.navTransitionLeft;
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
} => {
	const updated = updateMain({
		msg,
		model,
		flowPuzzle,
	});

	const updatedHint = FlowHint.update({
		model: updated.model,
		msg,
		flowPuzzle,
	});

	const updatedReset = updateReset({
		model: updatedHint.model,
		msg,
		flowPuzzle,
	});

	return {
		event: updatedReset.event ?? updatedHint.event ?? updated.event,
		model: updatedReset.model,
	};
};

const resetPipes = (model: Model): Model => {
	return {
		...model,
		pipesBySourceId: {},
	};
};

const updateReset: typeof update = ({ model, msg }) => {
	switch (msg.t) {
		case "user-clicked-reset": {
			return {
				model: pipe(model, resetPipes, FlowHint.resetUsedHints),
				event: {
					t: "resetted",
				},
			};
		}
		default: {
			return { model };
		}
	}
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
		case "user-pressed-down-node": {
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
		case "user-dragged-over-node": {
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

		case "user-pressed-up-node": {
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

		case "user-dragging-left": {
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
	const derived = FlowHint.toFlow({
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
			onDraggedOver={(nodeId) =>
				input.dispatch({ t: "user-dragged-over-node", nodeId })
			}
			onPressDown={(nodeId) =>
				input.dispatch({ t: "user-pressed-down-node", nodeId })
			}
			onPressUp={(nodeId) =>
				input.dispatch({ t: "user-pressed-up-node", nodeId })
			}
			onLeave={() => input.dispatch({ t: "user-dragging-left" })}
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
			usedHints={FlowHint.toUsedHints(input.model)}
		/>
	);
};

export const viewHintAction = FlowHint.viewHintAction;

export const viewResetAction = (input: {
	flowPuzzle: FlowPuzzle;
	model: Model;
	dispatch: (m: Msg) => void;
	ctx: {
		t: Translator;
	};
}): ActionProps => {
	const flow = toFlow({ model: input.model, flow: input.flowPuzzle.flow });
	const disabled = Flow.isPipesEmpty(flow);
	return Actions.reset({
		ctx: input.ctx,
		onClick: () => input.dispatch({ t: "user-clicked-reset" }),
		disabled,
	});
};

export const defaultCheckmarkAnimationDuration = TimeSpan.seconds(1 / 2);

export const CheckmarkAnimation = (input: {
	open: boolean;
	duration?: TimeSpan | null | undefined;
}) => {
	const duration = input.duration ?? defaultCheckmarkAnimationDuration;
	return (
		<Transition
			id="checkmark"
			onEnter={animateCheckmark({ duration })}
			onExit={async () => {}}
			mode="out-in"
			className="pointer-events-none"
		>
			{input.open && (
				<div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none">
					<IconCheckmark className="aspect-square w-full opacity-50 pointer-events-none" />
				</div>
			)}
		</Transition>
	);
};

const animateCheckmark =
	(input: { duration: TimeSpan }) => async (node: HTMLElement) => {
		node.style.transition = "all 0.3s ease-in-out";
		node.style.opacity = "0";
		node.style.transform = "scale(0.8)";
		await new Promise((r) => setTimeout(r, 50));
		node.style.opacity = "1";
		node.style.transform = "scale(1)";
		await new Promise((r) =>
			setTimeout(r, TimeSpan.toMilliseconds(input.duration)),
		);
		node.style.opacity = "0";
		node.style.transform = "scale(0.8)";
	};
