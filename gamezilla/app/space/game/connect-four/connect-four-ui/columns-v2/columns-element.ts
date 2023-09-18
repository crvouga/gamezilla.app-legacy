import { easeAttrs } from "gamezilla/@SHARED/core";
import { gameTheme } from "..";
import {
  COLUMN_COUNT,
  ColumnIndex,
  MAX_COLUMN_HEIGHT,
  Win,
  isColumnIndex,
  toWins,
} from "../../connect-four";
import { ColumnsProps, columnsPropsSub } from "./shared";

declare global {
  namespace preact.createElement.JSX {
    interface IntrinsicElements {
      "connect-four-columns": {
        "initial-columns-json": string;
      };
    }
  }
  namespace JSX {
    interface IntrinsicElements {
      "connect-four-columns": {
        "initial-columns-json": string;
      };
    }
  }
}

type SvgIds = {
  playerOneGradient: string;
  playerTwoGradient: string;
  holePattern: string;
  columnGradient: string;
  holeMask: string;
};

const randomId = 123;
const ids = {
  playerOneGradient: `playerOneGradient${randomId}`,
  playerTwoGradient: `playerTwoGradient${randomId}`,
  holePattern: `holePattern${randomId}`,
  columnGradient: `columnGradient${randomId}`,
  holeMask: `holeMask${randomId}`,
};

/* Have to increase the viewBox so that the draw animation is smooth >:-{ */
const N = 1000;

if (typeof window !== "undefined" && "customElements" in window) {
  customElements.define(
    "connect-four-columns",
    class extends HTMLElement {
      private props: ColumnsProps | null = null;
      private prevProps: ColumnsProps | null = null;
      private cleanUps: (() => void)[] = [];

      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }

      disconnectedCallback() {
        for (const cleanUp of this.cleanUps) {
          cleanUp();
        }
      }

      connectedCallback() {
        this.initUI();
      }

      initUI() {
        const unsubscribe = columnsPropsSub.subscribe((props) => {
          this.prevProps = this.props;
          this.props = props;
          this.syncUI();
        });
        this.cleanUps.push(unsubscribe);

        const initialColumns = this.getAttribute("initial-columns-json");
        if (initialColumns) {
          this.props = {
            columns: JSON.parse(initialColumns),
          };
        }

        if (!this.shadowRoot) {
          return;
        }

        const style = document.createElement("style");
        style.textContent = `
          :host {
            display: block;
            width: 100%;
          }
        `;
        this.shadowRoot.appendChild(style);

        this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
          }
        </style>
        <svg width="100%" viewBox="0 0 ${COLUMN_COUNT} ${MAX_COLUMN_HEIGHT}">
          ${createSvgDefs({ ids })}

          <g transform="translate(0, ${MAX_COLUMN_HEIGHT}) scale(1,-1)">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="${gameTheme.primary.darker}"
              ></rect>

            <g id="discs" transform="translate(0.5, 0.5)"></g>

            <rect
              x="0"
              y="0"
              width="${COLUMN_COUNT}"
              height="${MAX_COLUMN_HEIGHT}"
              fill="url(#${ids.columnGradient})"
              mask="url(#${ids.holeMask})"
            />

            <svg
              id="wins"
              x="0"
              y="0"
              width="${COLUMN_COUNT}"
              height="${MAX_COLUMN_HEIGHT}"
              viewBox="0 0 ${COLUMN_COUNT * N} ${MAX_COLUMN_HEIGHT * N}"></svg>

            <g id="columns"></g>
          </g>
        </svg>`;

        this.initColumns();
        if (this.props) {
          this.initDiscs(this.props);
          this.initWins(this.props);
        }
      }

      onColumnClick(columnIndex: ColumnIndex) {
        if (!this.props) {
          return;
        }

        this.props.onClick?.(columnIndex);
      }

      initColumns() {
        if (!this.shadowRoot) {
          return;
        }
        const columns = this.shadowRoot.getElementById("columns");

        for (let columnIndex = 0; columnIndex < COLUMN_COUNT; columnIndex++) {
          const column = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );

          column.setAttribute("x", `${columnIndex}`);
          column.setAttribute("y", "0");
          column.setAttribute("width", "1");
          column.setAttribute("height", `${MAX_COLUMN_HEIGHT}`);
          column.setAttribute("fill", "transparent");
          column.setAttribute("stroke", "none");
          const onClick = () => {
            if (isColumnIndex(columnIndex)) {
              this.onColumnClick(columnIndex);
            }
          };
          column.addEventListener("click", onClick);
          this.cleanUps.push(() => {
            column.removeEventListener("click", onClick);
          });
          columns?.appendChild(column);
        }
      }

      initDiscs(props: ColumnsProps) {
        if (!this.shadowRoot) {
          return;
        }
        const discs = this.shadowRoot.getElementById("discs");

        if (!discs) {
          return;
        }

        discs.innerHTML = "";

        for (let x = 0; x < props.columns.length; x++) {
          for (let y = 0; y < props.columns[x]!.length; y++) {
            const discNode = this.createDiscNode({
              x,
              y,
              player: props.columns[x]![y]!,
            });
            discs?.appendChild(discNode);
          }
        }
      }

      createDiscNode({
        x,
        y,
        player,
      }: {
        x: number;
        y: number;
        player: "player-one" | "player-two";
      }) {
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );

        circle.setAttribute("id", this.toDiscId({ x, y }));
        circle.setAttribute("cx", `${x}`);
        circle.setAttribute("cy", `${y}`);
        circle.setAttribute("r", "0.425");
        circle.setAttribute(
          "fill",
          player === "player-one"
            ? `url(#${ids.playerOneGradient})`
            : `url(#${ids.playerTwoGradient})`
        );
        return circle;
      }

      toDiscId(input: { x: number; y: number }) {
        return `disc-${input.x}-${input.y}`;
      }

      syncDiscs() {
        if (!this.props) {
          return;
        }

        if (!this.shadowRoot) {
          return;
        }

        const discsNode = this.shadowRoot.getElementById("discs");

        if (!(discsNode instanceof SVGGElement)) {
          return;
        }

        for (let x = 0; x < COLUMN_COUNT; x++) {
          for (let y = 0; y < MAX_COLUMN_HEIGHT; y++) {
            const disc = this.props.columns[x]![y]!;

            const node = discsNode.querySelector(`#${this.toDiscId({ x, y })}`);

            if (!disc && node) {
              if (node instanceof SVGCircleElement) {
                this.discExit({ node: node, x, y });
              }
              continue;
            }

            if (disc && !node) {
              this.discEnter({
                discsNode,
                player: disc,
                x,
                y,
              });
            }
          }
        }
      }

      async discExit({
        node,
        x,
        y,
      }: {
        node: SVGCircleElement;
        x: number;
        y: number;
      }) {
        if (node.dataset.exiting === "true") {
          return;
        }

        node.dataset.exiting = "true";

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
      }

      async discEnter({
        player,
        x,
        y,
        discsNode,
      }: {
        discsNode: SVGGElement;
        player: "player-one" | "player-two";
        x: number;
        y: number;
      }) {
        const node = this.createDiscNode({ x, y, player });
        discsNode.appendChild(node);

        await easeAttrs(node, {
          cy: {
            from: MAX_COLUMN_HEIGHT + 1,
            to: y,
            duration: 200 + 300 * (1 - y / MAX_COLUMN_HEIGHT),
            easing: { type: "ease-out-quint" },
          },
        });
      }

      syncWins() {
        const winsNode = this.shadowRoot?.getElementById("wins");

        if (!(winsNode instanceof SVGElement)) {
          return;
        }

        const prevWins = this.prevProps ? toWins(this.prevProps.columns) : null;
        const wins = this.props ? toWins(this.props.columns) : [];

        const additions = prevWins
          ? wins.filter(
              (win) =>
                !prevWins.some((w) => this.toWinId(w) === this.toWinId(win))
            )
          : wins;

        const removals = prevWins
          ? prevWins.filter(
              (win) => !wins.some((w) => this.toWinId(w) === this.toWinId(win))
            )
          : [];

        for (const win of additions) {
          this.drawWin({
            win,
            winsNode,
          });
        }

        for (const win of removals) {
          const node = winsNode.querySelector(`#${this.toWinId(win)}`);

          if (node instanceof SVGRectElement) {
            this.undrawWin({
              node,
            });
          }
        }
      }

      initWins(props: ColumnsProps) {
        if (!this.shadowRoot) {
          return;
        }
        const winsNodes = this.shadowRoot.getElementById("wins");

        if (!winsNodes) {
          return;
        }

        winsNodes.innerHTML = "";

        const wins = toWins(props.columns);
        for (const win of wins) {
          const node = this.createWinNode(win);
          winsNodes.appendChild(node);
        }
      }
      toWinId(win: Win) {
        return `win-${win.map((pos) => `${pos.x}-${pos.y}`).join("-")}`;
      }

      async drawWin({ win, winsNode }: { win: Win; winsNode: SVGElement }) {
        const node = this.createWinNode(win);
        winsNode.appendChild(node);

        const length = node.getTotalLength();
        node.style.strokeDasharray = length.toString();
        node.style.strokeDashoffset = length.toString();
        node.style.stroke = "#fff";

        const animation = node.animate(
          [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
          {
            duration: 500,
            easing: "ease-in-out",
            fill: "both",
          }
        );

        await animation.finished;
      }

      async undrawWin({ node }: { node: SVGRectElement }) {
        if (node.dataset.animating === "true") {
          return;
        }

        node.dataset.animating = "true";

        const length = node.getTotalLength();
        node.style.strokeDasharray = length.toString();
        node.style.strokeDashoffset = "0";

        const animation = node.animate(
          [{ strokeDashoffset: 0 }, { strokeDashoffset: length }],
          {
            duration: 500,
            easing: "ease-in-out",
            fill: "both",
          }
        );

        await animation.finished;

        node.remove();
      }

      createWinNode(win: Win) {
        const westMost = win[0];
        const eastMost = win[win.length - 1]!;
        const theta = angleBetween(westMost, eastMost);
        const originX = (westMost.x + 0.5) * N;
        const originY = (westMost.y + 0.5) * N;
        const width = (distance(westMost, eastMost) + 1) * N;

        const winNode = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        winNode.setAttribute("id", this.toWinId(win));
        winNode.setAttribute("x", `${westMost.x * N}`);
        winNode.setAttribute("y", `${westMost.y * N}`);
        winNode.setAttribute("width", `${width}`);
        winNode.setAttribute("height", `${N}`);
        winNode.setAttribute("rx", `${N / 2}`);
        winNode.setAttribute("stroke", "#fff");
        winNode.setAttribute("fill", "transparent");
        winNode.setAttribute("stroke-width", `${N / 8}`);
        winNode.classList.add("pointer-events-none");
        winNode.setAttribute(
          "transform",
          `rotate(${theta} ${originX} ${originY})`
        );
        return winNode;
      }

      syncUI() {
        this.syncDiscs();
        this.syncWins();
      }
    }
  );
}

const createSvgDefs = ({ ids }: { ids: SvgIds }) => {
  return `<defs>
      <pattern
        id="${ids.holePattern}"
        patternUnits="userSpaceOnUse"
        width="1"
        height="1">
        <circle cx="0.5" cy="0.5" r="0.425" fill="black"></circle>
      </pattern>

      <mask id="${ids.holeMask}">
        <rect
          x="0"
          y="0"
          width="${COLUMN_COUNT}"
          height="${MAX_COLUMN_HEIGHT}"
          fill="white"></rect>
        <rect
          x="0"
          y="0"
          width="${COLUMN_COUNT}"
          height="${MAX_COLUMN_HEIGHT}"
          fill="url(#${ids.holePattern})"></rect>
      </mask>

      <linearGradient id="${ids.columnGradient}" gradient-transform="rotate(90)">
        <stop offset="0%" stop-color="${gameTheme.primary.light}" />
        <stop offset="100%" stop-color="${gameTheme.primary.dark}" />
      </linearGradient>

      <linearGradient id="${ids.playerOneGradient}" gradient-transform="rotate(90)">
        <stop offset="0%" stop-color="${gameTheme["player-one"].light}" />
        <stop offset="100%" stop-color="${gameTheme["player-one"].dark}" />
      </linearGradient>

      <linearGradient id="${ids.playerTwoGradient}" gradient-transform="rotate(90)">
        <stop offset="0%" stop-color="${gameTheme["player-two"].light}" />
        <stop offset="100%" stop-color="${gameTheme["player-two"].dark}" />
      </linearGradient>
    </defs>`;
};

type Pos2 = { x: number; y: number };

const distance = (a: Pos2, b: Pos2): number => {
  return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5;
};

const angleBetween = (a: Pos2, b: Pos2): number => {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
};
