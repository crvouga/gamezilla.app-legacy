import { cmd, sub, time } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as Keyboard from "Framework/Keyboard";
import { Sub } from "Framework/Sub";
import * as Navigation from "Navigation";
import * as View from "View";
import * as Position from "./Position";
import * as Direction from "./Direction";

//
//
//
// Model
//
//
//

export type Model = {
  status: Status;
  head: Position.Position;
  tail: Position.Position[];
  apple: Position.Position;
  tailLength: number;
  direction: Direction.Direction;
  bounds: {
    lower: Position.Position;
    upper: Position.Position;
  };
};

export const init: Model = {
  status: "paused",
  head: { x: 4, y: 4 },
  tail: [
    { x: 3, y: 4 },
    { x: 2, y: 4 },
  ],
  apple: { x: 7, y: 4 },
  direction: "right",
  tailLength: 4,
  bounds: {
    lower: {
      x: 0,
      y: 0,
    },
    upper: {
      x: 12,
      y: 12,
    },
  },
};

type Status = "paused" | "playing";

const toggle = (status: Status): Status => {
  switch (status) {
    case "paused":
      return "playing";

    case "playing":
      return "paused";
  }
};

const shuffle = <T,>(xs: T[]): T[] => {
  const ys = [...xs];

  ys.sort(() => (Math.random() > 0.5 ? 1 : -1));

  return ys;
};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "Tick" }
  | { type: "UserClickedBoard" }
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedRestartButton" }
  | { type: "UserClickedToggleButton" }
  | { type: "UserPressedKeyDown"; key: Keyboard.Key };

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedRestartButton":
      return [init, cmd.none];

    case "Tick":
      const tailNew = [model.head, ...model.tail].slice(0, model.tailLength);

      const headNew = Position.add(
        model.head,
        Direction.toVector(model.direction)
      );

      const isEatingApple = [headNew, ...tailNew].some((position) =>
        Position.equals(position, model.apple)
      );

      const appleNew = isEatingApple
        ? shuffle(Position.range(model.bounds))[0] ?? model.apple
        : model.apple;

      const tailLengthNew = isEatingApple
        ? model.tailLength + 1
        : model.tailLength;

      return [
        {
          ...model,
          head: headNew,
          tail: tailNew,
          apple: appleNew,
          tailLength: tailLengthNew,
        },
        cmd.none,
      ];

    case "UserClickedBackButton":
      return [model, Navigation.back()];

    case "UserClickedBoard":
      return [model, cmd.none];

    case "UserPressedKeyDown":
      const directionNew = Direction.fromKey(msg.key, model.direction);

      const statusNew =
        msg.key === "Space" ? toggle(model.status) : model.status;

      return [
        {
          ...model,
          status: statusNew,
          direction: directionNew,
        },
        cmd.none,
      ];

    case "UserClickedToggleButton":
      switch (model.status) {
        case "paused":
          return [{ ...model, status: "playing" }, cmd.none];

        case "playing":
          return [{ ...model, status: "paused" }, cmd.none];
      }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub<Msg> => {
  return sub.batch<Msg>([
    model.status === "playing"
      ? time.every(1000 / 4, () => ({ type: "Tick" }))
      : sub.none,
    Keyboard.keyDowns((key) => ({ type: "UserPressedKeyDown", key })),
  ]);
};

//
//
//
// View
//
//
//

const theme = {
  light: "#AAD751",
  dark: "#A2D149",
  snake: "#4573E8",
  apple: "#E7471D",
};

export const view =
  (model: Model): View.View<Msg> =>
  (dispatch) => {
    return (
      <>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title="Snake"
        />
        <svg width="100%" viewBox={toViewbox(model.bounds)}>
          {Position.range(model.bounds).map(({ x, y }, index) => (
            <rect
              key={`${x} ${y} ${index}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={theme[toTileVariant({ x, y })]}
              stroke="none"
            />
          ))}

          {viewApple(model)}
          {viewSnake(model)}
        </svg>

        <View.Box sx={{ paddingX: 2, paddingY: 1 }}>
          <View.Button
            size="large"
            fullWidth
            onClick={() => dispatch({ type: "UserClickedRestartButton" })}
            sx={{ marginBottom: 2 }}
          >
            Restart
          </View.Button>
          <View.Button
            size="large"
            fullWidth
            onClick={() => dispatch({ type: "UserClickedToggleButton" })}
          >
            {model.status === "playing" ? "pause" : "play"}
          </View.Button>
        </View.Box>
      </>
    );
  };

const viewSnake = ({ head, tail }: Model) => {
  return (
    <g>
      {[head, ...tail].map(({ x, y }, index) => (
        <rect
          key={`x ${x} y ${y} index ${index}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={theme.snake}
          stroke="none"
        />
      ))}
    </g>
  );
};

const viewApple = ({ apple }: Model) => {
  const { x, y } = apple;
  return (
    <g>
      <rect x={x} y={y} width={1} height={1} fill={theme.apple} stroke="none" />
    </g>
  );
};

type TileVariant = "light" | "dark";

const toTileVariant = (position: Position.Position): TileVariant => {
  if (
    (isEven(position.x) && isOdd(position.y)) ||
    (isOdd(position.x) && isEven(position.y))
  ) {
    return "light";
  }
  return "dark";
};

const isEven = (x: number) => x % 2 === 0;
const isOdd = (x: number) => !isEven(x);

const toViewbox = ({ lower, upper }: Model["bounds"]) =>
  [lower.x, lower.y, upper.x, upper.y].join(", ");

export const Icon = () => {
  const bounds: Model["bounds"] = {
    lower: {
      x: 0,
      y: 0,
    },
    upper: {
      x: 4,
      y: 4,
    },
  };
  return (
    <svg width="100%" viewBox={toViewbox(bounds)}>
      {Position.range(bounds).map(({ x, y }, index) => (
        <rect
          key={`${x} ${y} ${index}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={theme[toTileVariant({ x, y })]}
          stroke="none"
        />
      ))}
    </svg>
  );
};
