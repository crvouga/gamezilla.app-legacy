import {
  Edge,
  EdgeFull,
  EdgeId,
  Model,
  Node,
  NodeId,
  TerminalNode,
  isStart,
  isTerminal,
  setEdgeGroup,
  addNode,
  toEdgeId,
  toNode,
  toGroup,
  yieldEdges,
  yieldInEdges,
  yieldOutEdges,
  yieldTerminalNodes,
  GroupId,
} from './flow';

export const startPath = <T extends Model>(
  model: T,
  terminal: TerminalNode
): T => {
  const cleared = clearEdges(
    clearTerminalNodes(model, terminal.groupId),
    terminal.groupId
  );
  const startNode: TerminalNode = {
    id: terminal.id,
    groupId: terminal.groupId,
    type: 'start',
  };
  return addNode(cleared, startNode);
};

const clearEdges = <T extends Model>(model: T, groupId: GroupId): T => {
  let modelNew: T = { ...model };
  for (const edge of yieldEdges(model)) {
    if (edge.groupId === groupId) {
      modelNew = setEdgeGroup(modelNew, toEdgeId(edge), null);
    }
  }
  return modelNew;
};

const clearTerminalNodes = <T extends Model>(model: T, groupId: GroupId): T => {
  let modelNew: T = model;

  for (const terminal of yieldTerminalNodes(model)) {
    if (terminal.groupId === groupId) {
      modelNew = addNode(modelNew, {
        ...terminal,
        type: null,
      });
    }
  }

  return modelNew;
};

//
//
//
// Extend Path
//
//
//

export const extendPath = <T extends Model>(
  model: T,
  groupId: GroupId,
  targetNodeId: NodeId
): T => {
  const targetNodeGroupId = toGroup(model, targetNodeId);

  if (targetNodeGroupId && targetNodeGroupId !== groupId) {
    return model;
  }

  const node = toNode(model, targetNodeId);

  if (!node) {
    return model;
  }

  if (isTerminal(node) && node.groupId !== groupId) {
    return model;
  }

  const pathStart = findGroupStart(model, groupId);

  if (!pathStart) {
    return model;
  }

  const modelWithoutPath = clearEdges(model, groupId);

  const walked = extendPathWalk({
    targetNodeId,
    groupId,
    modelWithPath: model,
    model: modelWithoutPath,
    currentNode: pathStart,
  });

  return walked;
};

const extendPathWalk = <T extends Model>({
  targetNodeId,
  groupId,
  modelWithPath,
  model,
  currentNode,
}: {
  targetNodeId: NodeId;
  groupId: GroupId;
  modelWithPath: T;
  model: T;
  currentNode: Node;
}): T => {
  if (currentNode.id === targetNodeId) {
    return model;
  }

  if (isTerminal(currentNode) && !isStart(currentNode)) {
    return model;
  }

  const edge = findOutEdgeByGroupId({
    model: modelWithPath,
    nodeId: currentNode.id,
    groupId: groupId,
  });

  if (!edge) {
    const shortestPath = findShortestEmptyPath({
      model: modelWithPath,
      start: currentNode.id,
      target: targetNodeId,
    });

    const updated = shortestPath.reduce(
      (acc, edgeId) => setEdgeGroup(acc, edgeId, groupId),
      model
    );

    return updated;
  }

  if (isInGroup(model, edge.to)) {
    return model;
  }

  const edgeId = toEdgeId({ from: currentNode.id, to: edge.to });

  const updated = setEdgeGroup(model, edgeId, groupId);

  return extendPathWalk({
    modelWithPath,
    groupId: groupId,
    targetNodeId,
    currentNode: edge.nodeTo,
    model: updated,
  });
};

const findShortestEmptyPath = ({
  model,
  start,
  target,
}: {
  model: Model;
  start: NodeId;
  target: NodeId;
}): EdgeId[] => {
  //
  //
  // Construct the breadth first tree
  //
  //
  const queue: NodeId[] = [];
  const visited = new Set<NodeId>();
  const tree: { [id: NodeId]: { parent?: NodeId } } = {};

  visited.add(start);
  queue.push(start);

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    visited.add(current);

    if (current === target) {
      break;
    }

    for (const outEdge of yieldOutEdges(model, current)) {
      const adjacent = outEdge.nodeTo;

      if (visited.has(adjacent.id)) {
        continue;
      }

      if (isInGroup(model, adjacent.id)) {
        continue;
      }

      if (isTerminal(adjacent) && adjacent.groupId !== toGroup(model, start)) {
        continue;
      }

      queue.push(adjacent.id);
      tree[adjacent.id] = { parent: current };
    }
  }

  //
  // Construct the path from the breadth first tree
  //

  let current = target;
  const nodePath: NodeId[] = [current];

  while (current !== start) {
    const parent = tree[current]?.parent;

    if (!parent) {
      break;
    }

    nodePath.push(parent);
    current = parent;
  }

  nodePath.reverse();

  //
  // Convert node path to edge path
  //

  const path: EdgeId[] = [];

  for (let i = 0; i < nodePath.length; i++) {
    const from = nodePath[i];
    if (!from) {
      continue;
    }
    const to = nodePath[i + 1];
    if (!to) {
      continue;
    }
    path.push(toEdgeId({ from, to }));
  }

  //
  // Done
  //

  return path;
};

export const isInGroup = (model: Model, nodeId: NodeId): boolean => {
  for (const edge of yieldOutEdges(model, nodeId)) {
    if (edge.groupId) {
      return true;
    }
  }

  for (const edge of yieldInEdges(model, nodeId)) {
    if (edge.groupId) {
      return true;
    }
  }

  return false;
};

const findOutEdgeByGroupId = <T extends Model>({
  model,
  nodeId,
  groupId,
}: {
  model: T;
  nodeId: NodeId;
  groupId: GroupId;
}): EdgeFull | null => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.groupId === groupId) {
      return outEdge;
    }
  }
  return null;
};

export const findGroupStart = (model: Model, groupId: GroupId): Node | null => {
  for (const terminal of yieldTerminalNodes(model)) {
    if (terminal.groupId === groupId && terminal.type === 'start') {
      return terminal;
    }
  }
  return null;
};

export const findGroupEnd = (
  model: Model,
  groupId: GroupId,
  nodeId: NodeId
): NodeId => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.groupId !== groupId) {
      continue;
    }

    if (outEdge.to === nodeId) {
      return nodeId;
    }

    return findGroupEnd(model, groupId, outEdge.to);
  }

  return nodeId;
};

//
//
//
// Autocomplete path
//
//
//

export const toAutocompleteEdge = (
  model: Model,
  groupId: GroupId
): Edge | null => {
  const pathStart = findGroupStart(model, groupId);

  if (!pathStart) {
    return null;
  }

  const pathEndId = findGroupEnd(model, groupId, pathStart.id);

  if (!pathEndId) {
    return null;
  }

  for (const edge of yieldOutEdges(model, pathEndId)) {
    if (isTerminal(edge.nodeTo) && edge.nodeTo.groupId === groupId) {
      return edge;
    }
  }

  return null;
};
