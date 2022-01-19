import List from "../utility/list";
import Record from "../utility/record";
import Position, { IPosition } from "./position";

type IState = {
  head: IPosition;
  tail: IPosition[];
  apples: IPosition[];
  direction: IPosition;
  bounds: {
    lower: IPosition;
    upper: IPosition;
  };
};

type IMessage = {
  type: "STEP";
};

const nextState = (state: IState, message: IMessage): IState => {
  switch (message.type) {
    case "STEP": {
      const nextHead = Position.add(state.head, state.direction);

      const nextTail = List.concat([state.head], state.tail);

      const maybeNextApple = List.head(
        List.shuffle(
          List.difference(
            Position.range(state.bounds.lower, state.bounds.upper),
            List.concat([state.head], state.tail, state.apples)
          )
        )
      );

      const nextState = Record.mergeLeft(state, {
        head: nextHead,
        tail: nextTail,
      });

      return nextState;
    }
  }
};

export default {
  nextState,
};
