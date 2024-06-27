import { IconCheckmark, cn } from "gamezilla-app/app/@/ui";
import { Flow, FlowUI } from "../../../flow";
import * as FlowGrid from "../flow-grid";
import type { VDom } from "gamezilla-app/@/vdom";

// const TERMINAL_NODE_RADIUS_ACTIVE = 0.4;
const TERMINAL_NODE_RADIUS = 0.33;
const EDGE_STROKE_WIDTH = 0.3;

let lastDraggedOver: Flow.NodeId | null = null;
let isCurrentDeviceTouch = false;

const View = (props: FlowUI.FlowViewProps<FlowGrid.Model>) => {
	const draggedOver = (nodeId: Flow.NodeId) => {
		if (!props.isDragging || lastDraggedOver === nodeId) {
			return;
		}
		lastDraggedOver = nodeId;
		props.onDraggedOver?.(nodeId);
	};

	const left = () => {
		if (!props.isDragging) {
			return;
		}
		lastDraggedOver = null;
		props.onLeave?.();
	};

	const onTouchMove = (e: TouchEvent) => {
		const nodeId = touchEventToNodeId(e);

		if (!nodeId) {
			return;
		}

		draggedOver?.(nodeId);
	};

	return (
		<svg
			className={cn(
				"w-full touch-none select-none p-[1px]",
				props.isDragging && "cursor-grabbing",
				props.disabled && "pointer-events-none",
				props.className,
			)}
			onContextMenu={(e) => {
				e.stopPropagation();
				e.preventDefault();
			}}
			viewBox={`${0} ${0} ${props.model.width} ${props.model.height}`}
			onTouchMove={onTouchMove}
			onMouseLeave={left}
			onMouseUp={left}
		>
			<title>Flow Grid</title>
			<ViewGrid {...props} />

			<ViewPipelines {...props} />

			<ViewAutocompleteEdge {...props} />

			<ViewCoordinates {...props} />

			{!props.disabled && (
				<ViewClickable {...props} draggedOver={draggedOver} />
			)}
		</svg>
	);
};

const ViewGrid = (props: FlowUI.FlowViewProps<FlowGrid.Model>) => {
	return (
		<>
			<defs>
				<pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
					<path
						d="M 1 0 L 0 0 0 1"
						fill="none"
						stroke="green"
						strokeWidth="0.02"
					/>
				</pattern>
			</defs>

			<rect
				x={0}
				y={0}
				width={props.model.width}
				height={props.model.height}
				fill="url(#grid)"
				stroke="green"
				strokeWidth="0.02"
			/>
		</>
	);
};

const ViewPipelines = (props: FlowUI.FlowViewProps<FlowGrid.Model>) => {
	return (
		<g transform="translate(0.5, 0.5)">
			{map(FlowGrid.yieldTerminals(props.model), (terminal) => {
				const groupColor = FlowUI.Color.groupIdToHex(terminal.groupId);
				const pipeline = FlowGrid.toPipeline(props.model, terminal.startId);
				const pipelinePathData = pipelineToSvgPathData(pipeline);
				const didUseHint = Boolean(props.usedHints?.[terminal.groupId]);
				const isConnectedWithPipes = Flow.isTerminalConnectedWithPipes(
					props.model,
					terminal.groupId,
				);
				const shouldShowUsedHint = isConnectedWithPipes&& didUseHint;

				return (
					<g key={terminal.groupId} id={terminal.groupId}>
						{!props.disableHighlight && (
							<path
								d={
									props.isGroupActive?.(terminal.groupId)
										? ""
										: pipelinePathData
								}
								stroke={groupColor}
								fill="none"
								strokeLinejoin="inherit"
								strokeLinecap="square"
								strokeWidth="1"
								strokeOpacity="0.2"
							/>
						)}

						<path
							d={pipelinePathData}
							stroke={groupColor}
							fill="none"
							strokeLinejoin="round"
							strokeLinecap="round"
							strokeWidth={EDGE_STROKE_WIDTH}
						/>

						<circle
							cx={terminal.start.x}
							cy={terminal.start.y}
							r={TERMINAL_NODE_RADIUS}
							fill={groupColor}
						/>

						{shouldShowUsedHint && (
							<WithPadding
								x={terminal.start.x - 0.5}
								y={terminal.start.y - 0.5}
								width={1}
								height={1}
								padding={0.25}
								render={(props) => <IconCheckmark {...props} />}
							/>
						)}

						{terminal.end && (
							<>
								<circle
									cx={terminal.end.x}
									cy={terminal.end.y}
									r={TERMINAL_NODE_RADIUS}
									fill={groupColor}
								/>
								{shouldShowUsedHint && (
									<WithPadding
										x={terminal.end.x - 0.5}
										y={terminal.end.y - 0.5}
										width={1}
										height={1}
										padding={0.25}
										render={(props) => <IconCheckmark {...props} />}
									/>
								)}
							</>
						)}
					</g>
				);
			})}
		</g>
	);
};

const WithPadding = (props: {
	x: number;
	y: number;
	width: number;
	height: number;
	padding: number;
	render: (props: {
		x: number;
		y: number;
		width: number;
		height: number;
	}) => VDom;
}) => {
	const { x, y, width, height, padding, render } = props;

	const paddedWidth = Math.max(0, width - padding * 2);
	const paddedHeight = Math.max(0, height - padding * 2);
	const paddedX = x + padding;
	const paddedY = y + padding;

	return render({
		x: paddedX,
		y: paddedY,
		width: paddedWidth,
		height: paddedHeight,
	});
};

const ViewAutocompleteEdge = (props: FlowUI.FlowViewProps<FlowGrid.Model>) => {
	return (
		props.autocompleteEdge && (
			<g transform="translate(0.5, 0.5)">
				<line
					x1={props.model.positions[props.autocompleteEdge.sourceId]?.x}
					y1={props.model.positions[props.autocompleteEdge.sourceId]?.y}
					x2={props.model.positions[props.autocompleteEdge.targetId]?.x}
					y2={props.model.positions[props.autocompleteEdge.targetId]?.y}
					stroke={FlowUI.Color.groupIdToHex(props.autocompleteEdge.groupId)}
					strokeWidth={EDGE_STROKE_WIDTH}
					strokeOpacity={0.5}
				/>
			</g>
		)
	);
};

const ViewCoordinates = (props: FlowUI.FlowViewProps<FlowGrid.Model>) => {
	return (
		props.showCoordinates && (
			<g transform="translate(0, 1)">
				{map(FlowGrid.yieldNodes(props.model), (node) => {
					return (
						<text
							className="pointer-events-none"
							key={node.nodeId}
							x={node.x}
							y={node.y}
							fontSize="0.2"
							fill="#fff"
						>
							{`${node.x},${node.y}`}
						</text>
					);
				})}
			</g>
		)
	);
};

const ViewClickable = (
	props: FlowUI.FlowViewProps<FlowGrid.Model> & {
		draggedOver?: (nodeId: Flow.NodeId) => void;
	},
) => {
	return (
		<g key={props.model.nodeHash}>
			{map(FlowGrid.yieldNodes(props.model), (node) => {
				return (
					<ViewClickableNode
						key={node.nodeId}
						node={node}
						onPressDown={props.onPressDown}
						onPressUp={props.onPressUp}
						draggedOver={props.draggedOver}
					/>
				);
			})}
		</g>
	);
};

const ViewClickableNode = (
	props: Pick<
		FlowUI.FlowViewProps<FlowGrid.Model>,
		"onPressDown" | "onPressUp"
	> & {
		node: FlowGrid.Node;
		draggedOver?: (nodeId: Flow.NodeId) => void;
	},
) => {
	return (
		<rect
			key={props.node.nodeId}
			x={props.node.x}
			y={props.node.y}
			width="1"
			height="1"
			fill="transparent"
			onMouseDown={() => {
				if (isCurrentDeviceTouch) {
					return;
				}
				props.onPressDown?.(props.node.nodeId);
			}}
			onMouseUp={(event) => {
				event.stopPropagation();
				props.onPressUp?.(props.node.nodeId);
			}}
			onMouseEnter={() => {
				props.draggedOver?.(props.node.nodeId);
			}}
			onTouchStart={() => {
				isCurrentDeviceTouch = true;
				props.onPressDown?.(props.node.nodeId);
			}}
			onTouchCancel={() => {
				isCurrentDeviceTouch = true;
				props.onPressUp?.(props.node.nodeId);
			}}
			onTouchEnd={() => {
				isCurrentDeviceTouch = true;
				props.onPressUp?.(props.node.nodeId);
			}}
		/>
	);
};

const pipelineToSvgPathData = (
	pipeline: Iterable<FlowGrid.PipeJoined>,
): string => {
	let path = "";
	for (const pipe of pipeline) {
		path += `M ${pipe.source.x} ${pipe.source.y} L ${pipe.target.x} ${pipe.target.y} `;
	}
	return path;
};

const touchEventToNodeId = (msgCore: TouchEvent): Flow.NodeId | null => {
	const touch = msgCore.touches[0];
	if (!touch) {
		return null;
	}
	const svg = msgCore.currentTarget;
	if (!(svg instanceof SVGSVGElement)) {
		return null;
	}
	const point = svg.createSVGPoint();
	point.x = touch.clientX;
	point.y = touch.clientY;
	const screenCTM = svg.getScreenCTM();
	if (!screenCTM) {
		return null;
	}
	const svgPosition = point.matrixTransform(screenCTM.inverse());
	const nodeId = FlowGrid.toNodeId({
		x: Math.floor(svgPosition.x),
		y: Math.floor(svgPosition.y),
	});
	return nodeId;
};

const map = <T, TY>(iterable: Iterable<T>, fn: (x: T) => TY): TY[] => {
	const result: TY[] = [];

	for (const x of iterable) {
		result.push(fn(x));
	}

	return result;
};

export const FlowGridUISvg = {
	View,
};
