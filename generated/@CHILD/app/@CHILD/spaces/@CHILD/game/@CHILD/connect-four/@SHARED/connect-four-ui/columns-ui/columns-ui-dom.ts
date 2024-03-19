import { easeAttrs, eq } from "gamezilla-app/@SHARED/core";
import { COLUMN_COUNT, ColumnIndex, Columns, MAX_COLUMN_HEIGHT, PlayerType, Win, isColumnIndex, findWins, } from "../../connect-four";
import { gameTheme } from "../shared";
export type ConnectFourUI = ReturnType<typeof create>;
type SvgDefIds = {
    playerOneGradient: string;
    playerTwoGradient: string;
    holePattern: string;
    columnGradient: string;
    holeMask: string;
};
const SVG_NS = "http://www.w3.org/2000/svg";
type Position = {
    x: number;
    y: number;
};
export const create = ({ initialColumns, onClick, }: {
    initialColumns: Columns;
    onClick?: (columnIndex: ColumnIndex) => void;
}) => {
    let root: HTMLElement | null = null;
    let svg: SVGElement | null = null;
    let discsGroup: SVGGElement | null = null;
    //
    let previousColumns: Columns = initialColumns;
    let previousWins: Win[] = [];
    const svgDefIds: SvgDefIds = {
        playerOneGradient: "player-one-gradient",
        playerTwoGradient: "player-two-gradient",
        holePattern: "hole-pattern",
        columnGradient: "column-gradient",
        holeMask: "hole-mask",
    };
    const setColumns = (columnsNew: Columns) => {
        if (!discsGroup) {
            return;
        }
        for (let y = 0; y < MAX_COLUMN_HEIGHT; y++) {
            for (let x = 0; x < COLUMN_COUNT; x++) {
                const cellPrev = previousColumns[x]?.[y];
                const cellNew = columnsNew[x]?.[y];
                if (cellPrev === cellNew) {
                    continue;
                }
                if (cellPrev === undefined && cellNew !== undefined) {
                    addDisc({
                        parent: discsGroup,
                        x,
                        y,
                        player: cellNew,
                        svgDefIds,
                    });
                }
                if (cellPrev !== undefined && cellNew === undefined) {
                    removeDisc({ parent: discsGroup, x, y });
                }
            }
        }
        previousColumns = columnsNew;
        const wins = findWins(columnsNew);
        for (const win of wins) {
            const westMost = win[0];
            const eastMost = win[win.length - 1];
            if (!westMost || !eastMost) {
                continue;
            }
            if (previousWins.some((previousWin) => eq(previousWin, win))) {
                continue;
            }
            const theta = angleBetween(westMost, eastMost);
            const originX = (westMost.x + 0.5) * n;
            const originY = (westMost.y + 0.5) * n;
            const width = (distance(westMost, eastMost) + 1) * n;
            const rectWin = document.createElementNS(SVG_NS, "rect");
            rectWin.setAttribute("transform", `rotate(${theta} ${originX} ${originY})`);
            rectWin.setAttribute("x", (westMost.x * n).toString());
            rectWin.setAttribute("y", (westMost.y * n).toString());
            rectWin.setAttribute("rx", (n / 2).toString());
            rectWin.setAttribute("stroke", "white");
            rectWin.setAttribute("fill", "transparent");
            rectWin.setAttribute("stroke-width", (n / 8).toString());
            rectWin.style.pointerEvents = "none";
            rectWin.setAttribute("width", width.toString());
            rectWin.setAttribute("height", n.toString());
            draw(rectWin);
        }
        previousWins = wins;
    };
    const draw = (node: SVGRectElement) => {
        const length = node.getTotalLength();
        easeAttrs(node, {
            "stroke-dasharray": {
                from: length,
                to: length,
                duration: 500,
            },
            "stroke-dashoffset": {
                from: length,
                to: 0,
                duration: 500,
            },
        });
    };
    const setRoot = (rootNew: HTMLElement | null) => {
        if (!rootNew) {
            root = null;
            return;
        }
        root = rootNew;
        svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("viewBox", `0 0 ${COLUMN_COUNT} ${MAX_COLUMN_HEIGHT}`);
        svg.appendChild(createSvgDefs(svgDefIds));
        const rootGroup = document.createElementNS(SVG_NS, "g");
        rootGroup.setAttribute("transform", `translate(0, ${MAX_COLUMN_HEIGHT}) scale(1,-1)`);
        //
        // background
        //
        const bg = document.createElementNS(SVG_NS, "rect");
        bg.setAttribute("width", "7");
        bg.setAttribute("height", "6");
        bg.setAttribute("fill", gameTheme.primary.darker);
        rootGroup.appendChild(bg);
        //
        // discs group
        //
        discsGroup = document.createElementNS(SVG_NS, "g");
        discsGroup.setAttribute("transform", "translate(0.5, 0.5)");
        rootGroup.appendChild(discsGroup);
        //
        // holes
        //
        const holes = document.createElementNS(SVG_NS, "rect");
        holes.setAttribute("x", "0");
        holes.setAttribute("y", "0");
        holes.setAttribute("width", COLUMN_COUNT.toString());
        holes.setAttribute("height", MAX_COLUMN_HEIGHT.toString());
        holes.setAttribute("fill", `url(#${svgDefIds.columnGradient})`);
        holes.setAttribute("mask", `url(#${svgDefIds.holeMask})`);
        rootGroup.appendChild(holes);
        //
        // win lines
        //
        const wins = document.createElementNS(SVG_NS, "svg");
        wins.setAttribute("x", "0");
        wins.setAttribute("y", "0");
        wins.setAttribute("width", COLUMN_COUNT.toString());
        wins.setAttribute("height", MAX_COLUMN_HEIGHT.toString());
        wins.setAttribute("viewBox", `0 0 ${COLUMN_COUNT * n} ${MAX_COLUMN_HEIGHT * n}`);
        rootGroup.appendChild(wins);
        //
        //
        //
        const columnsGroup = document.createElementNS(SVG_NS, "g");
        for (let columnIndex = 0; columnIndex < COLUMN_COUNT; columnIndex++) {
            const column = document.createElementNS(SVG_NS, "rect");
            column.setAttribute("x", columnIndex.toString());
            column.setAttribute("y", "0");
            column.setAttribute("width", "1");
            column.setAttribute("height", MAX_COLUMN_HEIGHT.toString());
            column.setAttribute("fill", "transparent");
            column.setAttribute("stroke", "transparent");
            column.setAttribute("stroke-width", "0");
            column.setAttribute("style", "cursor: pointer;");
            column.addEventListener("click", () => {
                if (isColumnIndex(columnIndex)) {
                    onClick?.(columnIndex);
                }
            });
            columnsGroup.appendChild(column);
        }
        rootGroup.appendChild(columnsGroup);
        //
        //
        //
        //
        //
        for (let y = 0; y < MAX_COLUMN_HEIGHT; y++) {
            for (let x = 0; x < COLUMN_COUNT; x++) {
                const player = previousColumns[x]?.[y];
                if (!player) {
                    continue;
                }
                const disc = makeDisc({ x, y, player, svgDefIds });
                discsGroup.appendChild(disc);
            }
        }
        //
        //
        //
        //
        svg.appendChild(rootGroup);
        root.appendChild(svg);
    };
    const cleanUp = () => {
        if (!root) {
            return;
        }
    };
    return {
        setColumns,
        setRoot,
        cleanUp,
    };
};
const makeDisc = ({ x, y, player, svgDefIds, }: {
    x: number;
    y: number;
    player: PlayerType;
    svgDefIds: SvgDefIds;
}) => {
    const disc = document.createElementNS(SVG_NS, "circle");
    disc.setAttribute("data-position", `${x},${y}`);
    disc.setAttribute("data-player", player);
    disc.setAttribute("r", "0.5");
    if (player === "player-one") {
        disc.setAttribute("fill", `url(#${svgDefIds.playerOneGradient})`);
    }
    if (player === "player-two") {
        disc.setAttribute("fill", `url(#${svgDefIds.playerTwoGradient})`);
    }
    disc.setAttribute("cx", `${x}`);
    disc.setAttribute("cy", `${y}`);
    return disc;
};
const addDisc = (input: {
    svgDefIds: SvgDefIds;
    parent: SVGElement;
    x: number;
    y: number;
    player: PlayerType;
}) => {
    const disc = makeDisc({ ...input, y: MAX_COLUMN_HEIGHT + 1 });
    input.parent.appendChild(disc);
    easeAttrs(disc, {
        cy: {
            from: MAX_COLUMN_HEIGHT + 1,
            to: input.y,
            duration: 200 + 300 * (1 - input.y / MAX_COLUMN_HEIGHT),
            easing: { type: "ease-out-quint" },
        },
    });
};
const removeDisc = async ({ parent, x, y, }: {
    parent: SVGElement;
    x: number;
    y: number;
}) => {
    const disc = parent.querySelector<SVGCircleElement>(`circle[data-position="${x},${y}"]`);
    if (!disc) {
        return;
    }
    await easeAttrs(disc, {
        cy: {
            from: y,
            to: y - MAX_COLUMN_HEIGHT,
            duration: 750,
            easing: { type: "ease-in-back" },
            delay: (x / COLUMN_COUNT) * 500,
        },
    });
    disc.remove();
};
/* Have to increase the viewBox so that the draw animation is smooth >:-{ */
const n = 1000;
const distance = (a: Position, b: Position): number => ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5;
const angleBetween = (a: Position, b: Position): number => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
/**
 *
 */
const createSvgDefs = (ids: SvgDefIds) => {
    const svgNS = SVG_NS;
    const svgDefs = document.createElementNS(svgNS, "defs");
    //
    const holePattern = document.createElementNS(svgNS, "pattern");
    holePattern.setAttribute("id", ids.holePattern);
    holePattern.setAttribute("patternUnits", "userSpaceOnUse");
    holePattern.setAttribute("width", "1");
    holePattern.setAttribute("height", "1");
    //
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", "0.5");
    circle.setAttribute("cy", "0.5");
    circle.setAttribute("r", "0.425");
    circle.setAttribute("fill", "black");
    holePattern.appendChild(circle);
    svgDefs.appendChild(holePattern);
    //
    const holeMask = document.createElementNS(svgNS, "mask");
    holeMask.setAttribute("id", ids.holeMask);
    //
    const maskRect1 = document.createElementNS(svgNS, "rect");
    maskRect1.setAttribute("x", "0");
    maskRect1.setAttribute("y", "0");
    maskRect1.setAttribute("width", COLUMN_COUNT.toString());
    maskRect1.setAttribute("height", MAX_COLUMN_HEIGHT.toString());
    maskRect1.setAttribute("fill", "white");
    holeMask.appendChild(maskRect1);
    //
    const maskRect2 = document.createElementNS(svgNS, "rect");
    maskRect2.setAttribute("x", "0");
    maskRect2.setAttribute("y", "0");
    maskRect2.setAttribute("width", COLUMN_COUNT.toString());
    maskRect2.setAttribute("height", MAX_COLUMN_HEIGHT.toString());
    maskRect2.setAttribute("fill", `url(#${ids.holePattern})`);
    holeMask.appendChild(maskRect2);
    svgDefs.appendChild(holeMask);
    const columnGradient = document.createElementNS(svgNS, "linearGradient");
    columnGradient.setAttribute("id", ids.columnGradient);
    columnGradient.setAttribute("gradientTransform", "rotate(90)");
    //
    const columnStop1 = document.createElementNS(svgNS, "stop");
    columnStop1.setAttribute("offset", "0%");
    columnStop1.setAttribute("stop-color", gameTheme.primary.light);
    columnGradient.appendChild(columnStop1);
    //
    const columnStop2 = document.createElementNS(svgNS, "stop");
    columnStop2.setAttribute("offset", "100%");
    columnStop2.setAttribute("stop-color", gameTheme.primary.dark);
    columnGradient.appendChild(columnStop2);
    svgDefs.appendChild(columnGradient);
    // Player One Gradient
    const playerOneGradient = document.createElementNS(svgNS, "linearGradient");
    playerOneGradient.setAttribute("id", ids.playerOneGradient);
    playerOneGradient.setAttribute("gradientTransform", "rotate(90)");
    const playerOneStop1 = document.createElementNS(svgNS, "stop");
    playerOneStop1.setAttribute("offset", "0%");
    playerOneStop1.setAttribute("stop-color", gameTheme["player-one"].light);
    playerOneGradient.appendChild(playerOneStop1);
    const playerOneStop2 = document.createElementNS(svgNS, "stop");
    playerOneStop2.setAttribute("offset", "100%");
    playerOneStop2.setAttribute("stop-color", gameTheme["player-one"].dark);
    playerOneGradient.appendChild(playerOneStop2);
    svgDefs.appendChild(playerOneGradient);
    // Player Two Gradient
    const playerTwoGradient = document.createElementNS(svgNS, "linearGradient");
    playerTwoGradient.setAttribute("id", ids.playerTwoGradient);
    playerTwoGradient.setAttribute("gradientTransform", "rotate(90)");
    const playerTwoStop1 = document.createElementNS(svgNS, "stop");
    playerTwoStop1.setAttribute("offset", "0%");
    playerTwoStop1.setAttribute("stop-color", gameTheme["player-two"].light);
    playerTwoGradient.appendChild(playerTwoStop1);
    const playerTwoStop2 = document.createElementNS(svgNS, "stop");
    playerTwoStop2.setAttribute("offset", "100%");
    playerTwoStop2.setAttribute("stop-color", gameTheme["player-two"].dark);
    playerTwoGradient.appendChild(playerTwoStop2);
    svgDefs.appendChild(playerTwoGradient);
    return svgDefs;
};
