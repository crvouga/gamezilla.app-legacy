import List from "../utility/list";
import { IRandomSeed } from "../utility/random";
import Record from "../utility/record";
import Position, { IPosition } from "./position";

type IState = {
  type: "SnakeState";
  randomSeed: IRandomSeed;
  head: IPosition;
  tail: IPosition[];
  apples: IPosition[];
  direction: IPosition;
  bounds: {
    lower: IPosition;
    upper: IPosition;
  };
};

export const init = (randomSeed: IRandomSeed): IState => {
  return {
    type: "SnakeState",
    randomSeed,
    head: Position.Position(0, 0),
    tail: [
      Position.Position(0, 0),
      Position.Position(0, 0),
      Position.Position(0, 0),
    ],
    apples: [Position.Position(0, 0)],
    direction: Position.Position(0, 0),
    bounds: {
      lower: Position.Position(0, 0),
      upper: Position.Position(0, 0),
    },
  };
};

type IMessage =
  | {
      type: "STEP";
    }
  | {
      type: "APPLE_SPAWNED";
      position: IPosition;
    };

const nextState = (state: IState, message: IMessage): IState => {
  switch (message.type) {
    case "APPLE_SPAWNED": {
      const position = message.position;

      return Record.mergeLeft(state, {
        apples: List.concat(state.apples, [position]),
      });
    }

    case "STEP": {
      const nextHead = Position.add(state.head, state.direction);

      const nextTail = List.concat([state.head], state.tail);

      const isSnakeEatingApple = List.any(
        (apple) => Position.equals(apple, nextHead),
        state.apples
      );

      if (!isSnakeEatingApple) {
        return Record.mergeLeft(state, {
          head: nextHead,
          tail: nextTail,
        });
      }

      const maybeNextApple = List.head(
        List.shuffle(
          List.difference(
            Position.range(state.bounds.lower, state.bounds.upper),
            List.concat([state.head], state.tail, state.apples)
          )
        )
      );

      switch (maybeNextApple.type) {
        case "Just": {
          const nextApple = maybeNextApple.value;

          return Record.mergeLeft(state, {
            head: nextHead,
            tail: nextTail,
            apples: [nextApple],
          });
        }

        case "Nothing":
          return Record.mergeLeft(state, {
            head: nextHead,
            tail: nextTail,
          });
      }
    }
  }
};

export default {
  nextState,
};
