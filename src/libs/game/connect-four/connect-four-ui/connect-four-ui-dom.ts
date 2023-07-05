import { Columns, PlayerType } from "../connect-four";

export const create = ({
  root,
  initialColumns,
}: {
  root: HTMLElement;
  initialColumns: Columns;
  onClick: (columnIndex: number) => void;
}) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 7 6");
  svg.setAttribute("width", "100%");
  root.appendChild(svg);

  let previousColumns: Columns = initialColumns;

  const setColumns = (columnsNew: Columns) => {
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 7; x++) {
        const cellPrev = previousColumns[y]?.[x];
        const cellNew = columnsNew[y]?.[x];

        if (cellPrev === cellNew) {
          continue;
        }

        if (cellPrev === undefined && cellNew !== undefined) {
          addDisc({ svg, x, y, player: cellNew });
        }

        if (cellPrev !== undefined && cellNew === undefined) {
          removeDisc({ svg, x, y });
        }
      }
    }

    previousColumns = columnsNew;
  };

  return {
    root,
    setColumns,
  };
};

const addDisc = ({
  x,
  y,
  player,
  svg,
}: {
  svg: SVGElement;
  x: number;
  y: number;
  player: PlayerType;
}) => {
  const discNode = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  discNode.setAttribute("r", "0.4");
  if (player === "PlayerOne") {
    discNode.setAttribute("fill", "red");
  }
  if (player === "PlayerTwo") {
    discNode.setAttribute("fill", "yellow");
  }
  discNode.setAttribute("cx", `${x}`);
  discNode.setAttribute("cy", `-1`);

  svg.appendChild(discNode);

  animateFall(discNode, y, 500);
};

const animateFall = (
  element: SVGCircleElement,
  endY: number,
  duration: number
) => {
  const start = performance.now();
  const startY = parseFloat(element.cy.baseVal.valueAsString);

  requestAnimationFrame(function animate(time) {
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    const currentY = startY + (endY - startY) * timeFraction;
    element.setAttribute("cy", currentY.toString());

    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    }
  });
};

const removeDisc = (_input: { svg: SVGElement; x: number; y: number }) => {
  //
};

export const initDefs = () => {
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const linearGradient = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  linearGradient.setAttribute("id", "gradient");
  linearGradient.setAttribute("x1", "0%");
  linearGradient.setAttribute("y1", "0%");
  linearGradient.setAttribute("x2", "0%");
  linearGradient.setAttribute("y2", "100%");
  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#f00");
  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#f00");
  linearGradient.appendChild(stop1);
  linearGradient.appendChild(stop2);
  defs.appendChild(linearGradient);
  return defs;
};
