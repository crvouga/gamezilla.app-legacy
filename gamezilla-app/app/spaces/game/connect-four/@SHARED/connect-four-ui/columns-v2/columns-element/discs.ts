import { easeAttrs } from "gamezilla-app/@shared/core";
import {
	COLUMN_COUNT,
	type Columns,
	MAX_COLUMN_HEIGHT,
} from "../../../connect-four";
import type { SvgIds } from "./shared";

const toDiscId = (input: { x: number; y: number }) => {
	return `disc-${input.x}-${input.y}`;
};

const createDiscNode = ({
	x,
	y,
	player,
	ids,
}: {
	ids: SvgIds;
	x: number;
	y: number;
	player: "player-one" | "player-two";
}) => {
	const circle = document.createElementNS(
		"http://www.w3.org/2000/svg",
		"circle",
	);

	circle.setAttribute("id", toDiscId({ x, y }));
	circle.setAttribute("cx", `${x}`);
	circle.setAttribute("cy", `${y}`);
	circle.setAttribute("r", "0.425");
	circle.setAttribute(
		"fill",
		player === "player-one"
			? `url(#${ids.playerOneGradient})`
			: `url(#${ids.playerTwoGradient})`,
	);
	return circle;
};

export const exitDisc = async ({
	node,
	x,
	y,
}: {
	node: SVGCircleElement;
	x: number;
	y: number;
}) => {
	if (node.dataset["exiting"] === "true") {
		return;
	}

	node.dataset["exiting"] = "true";

	await easeAttrs(node, {
		cy: {
			from: y,
			to: y - MAX_COLUMN_HEIGHT,
			duration: 750,
			easing: { type: "ease-in-back" },
			delay: (x / COLUMN_COUNT) * 500,
		},
	});

	node.remove();
};

export const enterDisc = async ({
	player,
	x,
	y,
	parentNode,
	ids,
}: {
	ids: SvgIds;
	parentNode: SVGGElement;
	player: "player-one" | "player-two";
	x: number;
	y: number;
}) => {
	const node = createDiscNode({ x, y, player, ids });
	parentNode.appendChild(node);

	await easeAttrs(node, {
		cy: {
			from: MAX_COLUMN_HEIGHT + 1,
			to: y,
			duration: 200 + 300 * (1 - y / MAX_COLUMN_HEIGHT),
			easing: { type: "ease-out-quint" },
		},
	});
};

export const initDiscs = ({
	columns,
	parentNode,
	ids,
}: {
	columns: Columns;
	parentNode: SVGGElement;
	ids: SvgIds;
}) => {
	parentNode.innerHTML = "";

	for (let x = 0; x < columns.length; x++) {
		for (let y = 0; y < columns[x]!.length; y++) {
			const discNode = createDiscNode({
				x,
				ids,
				y,
				player: columns[x]![y]!,
			});
			parentNode?.appendChild(discNode);
		}
	}
};

export function syncDiscs({
	parentNode,
	columns,
	ids,
}: {
	parentNode: SVGGElement;
	columns: Columns;
	ids: SvgIds;
}) {
	for (let x = 0; x < COLUMN_COUNT; x++) {
		for (let y = 0; y < MAX_COLUMN_HEIGHT; y++) {
			const disc = columns[x]![y]!;

			const node = parentNode.querySelector(`#${toDiscId({ x, y })}`);

			if (!disc && node) {
				if (node instanceof SVGCircleElement) {
					exitDisc({ node: node, x, y });
				}
				continue;
			}

			if (disc && !node) {
				enterDisc({
					ids,
					parentNode,
					player: disc,
					x,
					y,
				});
			}
		}
	}
}
