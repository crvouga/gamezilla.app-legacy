import { Flow, FlowAlgoPath } from '../flow';
import * as FlowGrid from './flow-grid';
import * as FlowGridUISvg from './flow-grid-ui.svg';

//
//
//
// Model
//
//
//

export type Model = State & {
  grid: FlowGrid.Model;
};

type State =
  | { t: 'idle' }
  | {
      t: 'dragging';
      activeGroupId: Flow.GroupId;
      autocompleteEdge?: Flow.Edge | null;
    };

export const init = (grid: FlowGrid.Model): Model => ({
  t: 'idle',
  grid,
});

//
//
//
// Update
//
//
//

export type Msg =
  | { t: 'dragged-over'; nodeId: Flow.NodeId }
  | { t: 'pressed-down-node'; nodeId: Flow.NodeId }
  | { t: 'pressed-up'; nodeId: Flow.NodeId }
  | { t: 'mouse-leave' };

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
} => {
  return {
    model: updateModel({ msg, model }),
  };
};

export const updateModel = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): Model => {
  if (model.t === 'idle') {
    if (msg.t === 'pressed-down-node') {
      return updatePressedDown({ model, nodeId: msg.nodeId });
    }

    return model;
  }

  if (model.t === 'dragging') {
    if (msg.t === 'dragged-over') {
      const gridNew = FlowAlgoPath.extendPath(
        model.grid,
        model.activeGroupId,
        msg.nodeId
      );

      const autocompleteEdge = FlowAlgoPath.toAutocompleteEdge(
        gridNew,
        model.activeGroupId
      );

      return {
        ...model,
        autocompleteEdge,
        grid: gridNew,
      };
    }

    if (msg.t === 'pressed-down-node') {
      return updatePressedDown({ model, nodeId: msg.nodeId });
    }

    if (msg.t === 'pressed-up') {
      return { ...addAutocompleteEdge(model), t: 'idle' };
    }

    if (msg.t === 'mouse-leave') {
      return { ...addAutocompleteEdge(model), t: 'idle' };
    }

    return model;
  }

  const check: never = model;

  return check;
};

const addAutocompleteEdge = (model: Model): Model => {
  if (model.t === 'dragging' && model.autocompleteEdge) {
    const gridNew = FlowAlgoPath.extendPath(
      model.grid,
      model.activeGroupId,
      model.autocompleteEdge.to
    );
    return {
      ...model,
      grid: gridNew,
    };
  }
  return model;
};

const updatePressedDown = ({
  model,
  nodeId,
}: {
  nodeId: Flow.NodeId;
  model: Model;
}): Model => {
  const node = FlowGrid.toNode(model.grid, nodeId);

  if (!node) {
    return model;
  }

  if (Flow.isTerminal(node)) {
    return {
      ...model,
      grid: FlowAlgoPath.startPath(model.grid, node),
      t: 'dragging',
      activeGroupId: node.groupId,
      autocompleteEdge: null,
    };
  }

  const pathColor = Flow.toGroup(model.grid, nodeId);

  if (pathColor) {
    return {
      ...model,
      grid: FlowAlgoPath.extendPath(model.grid, pathColor, node.id),
      t: 'dragging',
      autocompleteEdge: null,
      activeGroupId: pathColor,
    };
  }

  return model;
};

//
//
//
// View
//
//
//

export const View = FlowGridUISvg.View;
