import {
  Eff,
  Keyboard,
  Option,
  Sub,
  exhaustive,
  isErr,
} from "gamezilla/@SHARED/core";
import * as Board from "./@SHARED/board";
import * as Direction from "./@SHARED/direction";
import * as Piece from "./@SHARED/piece";
import * as Position from "./@SHARED/position";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  MsgToClient,
  columnCount,
  initShared,
  rowCount,
  toGhostPiece,
  toPiece,
} from "./tetris.core";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: Model = {
  coreModel: initShared,
  touched: Option.None,
};

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "MouseMove": {
      return [model, Eff.None];
    }

    case "TouchStart": {
      return [{ ...model, touched: Option.Some(msg[1]) }, Eff.None];
    }

    case "TouchMove": {
      if (model.touched.type === "none") {
        return [model, Eff.None];
      }

      const from = model.touched.value;

      const to = msg[1];

      const direction = positionsToDirection({ from, to });

      if (direction === "none") {
        return [model, Eff.None];
      }

      return [model, Eff.None];
    }

    case "TouchEnd": {
      return [{ ...model, touched: Option.None }, Eff.None];
    }

    case "PressedKey": {
      const key = msg[1];

      if (key === "Space") {
        return [model, Eff.None];
      }

      if (key === "ArrowUp" || key === "W" || key === "w") {
        return [model, Eff.None];
      }

      const direction = keyToDirection(key);

      if (direction !== "none") {
        return [model, Eff.None];
      }

      return [model, Eff.None];
    }

    case "ClickedBoard": {
      // const position = msg[1]

      return [model, Eff.None];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

const positionsToDirection = ({
  from,
  to,
}: {
  from: Position.Position;
  to: Position.Position;
}): Direction.Direction | "none" => {
  const xDelta = to.x - from.x;
  const yDelta = to.y - from.y;

  if (xDelta < 0) {
    return "Left";
  }

  if (xDelta > 0) {
    return "Right";
  }

  if (yDelta > 0) {
    return "Down";
  }

  return "none";
};

const keyToDirection = (key: Keyboard.Key): Direction.Direction | "none" => {
  switch (key) {
    case "A":
    case "a":
    case "ArrowLeft":
      return "Left";

    case "D":
    case "d":
    case "ArrowRight":
      return "Right";

    case "S":
    case "s":
    case "ArrowDown":
      return "Down";

    default:
      return "none";
  }
};

export const updateFromServer = (
  msg: MsgToClient,
  model: Model
): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "MouseMove_Done": {
      const result = msg[1];

      if (isErr(result)) {
        return [model, Eff.None];
      }

      const modelNew = result.value;

      return [{ ...model, coreModel: modelNew }, Eff.None];
    }

    case "InputDrop_Done": {
      const result = msg[1];

      if (isErr(result)) {
        return [model, Eff.None];
      }

      const modelNew = result.value;

      return [{ ...model, coreModel: modelNew }, Eff.None];
    }

    case "Tick_Done": {
      const modelNew = msg[1];
      return [{ ...model, coreModel: modelNew }, Eff.None];
    }

    case "InputRotate_Done": {
      const result = msg[1];

      if (isErr(result)) {
        return [model, Eff.None];
      }

      const modelNew = result.value;

      return [{ ...model, coreModel: modelNew }, Eff.None];
    }

    case "InputTranslate_Done": {
      const result = msg[1];

      if (isErr(result)) {
        return [model, Eff.None];
      }

      const modelNew = result.value;

      return [{ ...model, coreModel: modelNew }, Eff.None];
    }
  }
};

export const mergeWithServer = ({
  clientModel,
  serverModel,
}: {
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  return {
    ...clientModel,
    coreModel: serverModel,
  };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Keyboard.keyDowns<Msg>((key) => ["PressedKey", key]);
};

//
//
//
// View
//
//
//

// const gridStroke = "rgba(255, 255, 255, 0.2)"
// const gridStrokeWidth = 0.025

export const View = ({
  dispatch,
}: {
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  return (
    <div>
      <div>
        <canvas
          onTouchMove={(msgEvt) => {
            const touch = msgEvt.touches[0];

            if (!touch) {
              return;
            }
          }}
          onClick={(msgEvt) => {
            dispatch(["ClickedBoard", mouseEventToPosition(msgEvt)]);
          }}
          onMouseMove={(msgEvt) => {
            const x = Math.floor(
              rescale({
                value: msgEvt.pageX - msgEvt.currentTarget.offsetLeft,
                from: [0, msgEvt.currentTarget.width],
                to: [0, columnCount],
              })
            );

            const y = Math.floor(
              rescale({
                value: msgEvt.pageY - msgEvt.currentTarget.offsetTop,
                from: [0, msgEvt.currentTarget.height],
                to: [0, rowCount],
              })
            );

            dispatch(["MouseMove", { x, y }]);
          }}
          onTouchStart={(msgEvt) => {
            const touch = msgEvt.touches[0];

            if (!touch) {
              return;
            }

            // const x = touch.clientX;
            // const y = touch.clientY;
            // console.log("Start", { x, y });
          }}
        />
      </div>

      {/* <svg width="100%" viewBox={[0, 0, columnCount, rowCount,].join(", ")}>
            {range(1, Board.toColumnCount(model.coreModel.board)).map(x => (
                <line key={x} x1={x} y1={0} x2={x} y2={rowCount} stroke={gridStroke} strokeWidth={gridStrokeWidth} />
            ))}

            {range(1, Board.toRowCount(model.coreModel.board)).map(y => (
                <line key={y} x1={0} y1={y} x2={columnCount} y2={y} stroke={gridStroke} strokeWidth={gridStrokeWidth} />
            ))}

            {Board.flatMap(model.coreModel.board, ({ cell, x, y }) => (
                <rect key={`${x}-${y}-${cell}`} width={1} height={1} x={x} y={y} fill={cell === 'Empty' ? 'transparent' : Piece.colors[cell]} />
            ))}

            {toGhostPiece(model.coreModel).map(position => (
                <rect key={`${position.x}-${position.y}`} width={1} height={1} x={position.x} y={position.y} fill={"rgba(0, 0, 0, 0.4)"} />
            ))}

            {toPiece(model.coreModel).map(position => (
                <rect key={`${position.x}-${position.y}`} width={1} height={1} x={position.x} y={position.y} fill={Piece.colors[model.coreModel.tetrominoName]} />
            ))}

            {Board.flatMap(model.coreModel.board, ({ x, y }) => (
                <rect
                    key={`${x}-${y}`}
                    width={1}
                    height={1}
                    x={x}
                    y={y}
                    fill="transparent"
                    onTouchStart={() => dispatch(['TouchStart', { x, y }])}
                    onTouchEnd={() => dispatch(['TouchEnd', { x, y }])}
                    onTouchMove={() => dispatch(['TouchMove', { x, y }])}
                />
            ))}

        </svg> */}
    </div>
  );
};

const mouseEventToPosition = (msgEvt: MouseEvent): Position.Position => {
  if (!(msgEvt.currentTarget instanceof HTMLCanvasElement)) {
    return {
      x: 0,
      y: 0,
    };
  }
  const x = Math.floor(
    rescale({
      value: msgEvt.pageX - msgEvt.currentTarget.offsetLeft,
      from: [0, msgEvt.currentTarget.width],
      to: [0, columnCount],
    })
  );

  const y = Math.floor(
    rescale({
      value: msgEvt.pageY - msgEvt.currentTarget.offsetTop,
      from: [0, msgEvt.currentTarget.height],
      to: [0, rowCount],
    })
  );

  return { x, y };
};

export const paint = (context: CanvasRenderingContext2D, model: Model) => {
  const columnCount = Board.toColumnCount(model.coreModel.board);
  const rowCount = Board.toRowCount(model.coreModel.board);
  const canvasWidth = context.canvas.width;
  const canvasHeight = context.canvas.height;
  const cellWidth = canvasWidth / columnCount;
  const cellHeight = canvasHeight / rowCount;
  const cellLength = Math.min(cellWidth, cellHeight);

  context.fillStyle = "#000";
  context.fillRect(0, 0, columnCount * cellLength, rowCount * cellLength);

  context.strokeStyle = "#222";

  for (let x = 0; x < columnCount; x++) {
    context.moveTo(x * cellLength, 0 * cellLength);
    context.lineTo(x * cellLength, rowCount * cellLength);
    context.stroke();
  }

  for (let y = 0; y < rowCount; y++) {
    context.moveTo(0 * cellLength, y * cellLength);
    context.lineTo(columnCount * cellLength, y * cellLength);
    context.stroke();
  }

  for (const { x, y } of toGhostPiece(model.coreModel)) {
    context.fillStyle = "#555";
    context.fillRect(x * cellLength, y * cellLength, cellLength, cellLength);
  }

  for (const { x, y } of toPiece(model.coreModel)) {
    context.fillStyle = Piece.colors[model.coreModel.tetrominoName];
    context.fillRect(x * cellLength, y * cellLength, cellLength, cellLength);
  }

  for (let x = 0; x < columnCount; x++) {
    for (let y = 0; y < rowCount; y++) {
      const cell = Board.toCell({ x, y }, model.coreModel.board);

      if (cell === "Empty") {
        continue;
      }
      context.fillStyle = Piece.colors[cell];
      context.fillRect(x * cellLength, y * cellLength, cellLength, cellLength);
    }
  }
};

const theme = {
  lightBlue: "#01DEEC",
  darkBlue: "#003D78",
  pieceBlue: "#2C2C7E",
};

export const CoverArt = () => {
  return (
    <svg width="100%" viewBox={[0, 0, 4, 4].join(", ")}>
      <rect width="100%" height="100%" fill={theme.lightBlue} />
      {Piece.pieces.T.map((position) =>
        Position.rotate(Position.rotate(position))
      )
        .map((position) => Position.add(position, { x: 1.5, y: 1 }))
        .map((position) => (
          <rect
            key={`${position.x}-${position.y}`}
            x={position.x}
            y={position.y}
            width={1}
            height={1}
            fill={theme.pieceBlue}
          />
        ))}
    </svg>
  );
};

type Range = [number, number];

const rescale = ({
  value,
  from,
  to,
}: {
  value: number;
  from: Range;
  to: Range;
}) => {
  return ((value - from[0]) * (to[1] - to[0])) / (from[1] - from[0]) + to[0];
};
