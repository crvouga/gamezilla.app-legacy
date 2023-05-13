export type NodeId = string & { readonly __brand: unique symbol };

export type EdgeId = string & { readonly __brand: unique symbol };

export const toEdgeId = (a: NodeId, b: NodeId): EdgeId => {
  if (a < b) {
    return `${a}-${b}` as EdgeId;
  }
  return `${b}-${a}` as EdgeId;
};

export const isEdgeId = (model: Model, id: string): id is EdgeId => {
  return id in model.edges;
};

export const isNodeId = (model: Model, id: string): id is NodeId => {
  return id in model.nodes;
};

export type Color = string;

//
//
//
// Model
//
//
//

export type Model = {
  nodes: {
    [id: NodeId]: Node;
  };

  edges: {
    [edgeId: EdgeId]: Edge;
  };

  edgesIn: {
    [from: NodeId]: {
      [to: NodeId]: EdgeId;
    };
  };

  edgesOut: {
    [to: NodeId]: {
      [from: NodeId]: EdgeId;
    };
  };
};

export type Edge = {
  from: NodeId;
  to: NodeId;
  color?: Color;
};

export type Node = TerminalNode | ConnectorNode;

export type TerminalNode = {
  id: NodeId;
  color: Color;
};

export type ConnectorNode = {
  id: NodeId;
};

export const isTerminal = (node: Node): node is TerminalNode => {
  return 'color' in node;
};

export const isConnector = (node: Node): node is ConnectorNode => {
  return !isTerminal(node);
};

//
//
//
// Init
//
//
//

export const empty: Model = {
  nodes: {},
  edges: {},
  edgesIn: {},
  edgesOut: {},
};

//
//
//
// Basic Operations
//
//
//

export const toNode = (model: Model, id: NodeId): Node | null => {
  return model.nodes[id] ?? null;
};

export type EdgeFull = {
  from: Node;
  to: Node;
  color?: Color;
};

export const toEdge = (model: Model, edgeId: EdgeId): EdgeFull | null => {
  const edge = model.edges[edgeId];

  if (!edge) {
    return null;
  }

  const from = model.nodes[edge.from];

  if (!from) {
    return null;
  }

  const to = model.nodes[edge.to];

  if (!to) {
    return null;
  }

  return { from, to, color: edge.color };
};

export const addNode = <T extends Model>(model: T, node: Node): T => {
  return {
    ...model,
    nodes: {
      ...model.nodes,
      [node.id]: node,
    },
  };
};

export const addEdge = <T extends Model>(graph: T, edge: Edge): T => {
  return {
    ...graph,
    edges: {
      ...graph.edges,
      [toEdgeId(edge.from, edge.to)]: edge,
    },
    edgesIn: {
      ...graph.edgesIn,
      [edge.to]: {
        ...graph.edgesIn[edge.to],
        [edge.from]: toEdgeId(edge.from, edge.to),
      },
    },
    edgesOut: {
      ...graph.edgesOut,
      [edge.from]: {
        ...graph.edgesOut[edge.from],
        [edge.to]: toEdgeId(edge.from, edge.to),
      },
    },
  };
};

export const modelToKey = (model: Model): string => {
  const nodeIds = Object.keys(model.nodes).sort();
  const edgeIds = Object.entries(model.edges)
    .reduce<string[]>((acc, [from, nodes]) => {
      const nodeIds = Object.keys(nodes).sort();
      return [...acc, ...nodeIds.map((to) => `${from}-${to}`)];
    }, [])
    .sort();
  return `${nodeIds.join(',')}|${edgeIds.join(',')}`;
};

//
//
//
//
//
//
//

export const yieldNodes = function* (model: Model): Generator<Node> {
  for (const nodeId in model.nodes) {
    if (!isNodeId(model, nodeId)) {
      continue;
    }

    const node = model.nodes[nodeId];

    if (node) {
      yield node;
    }
  }
};

export const yieldEdges = function* (model: Model): Generator<EdgeFull> {
  for (const edgeId in model.edges) {
    if (!isEdgeId(model, edgeId)) {
      continue;
    }

    const edge = toEdge(model, edgeId);

    if (!edge) {
      continue;
    }

    yield edge;
  }
};

export const yieldTerminalNodes = function* (
  model: Model
): Generator<TerminalNode> {
  for (const node of yieldNodes(model)) {
    if (isTerminal(node)) {
      yield node;
    }
  }
};

export const yieldConnectorNodes = function* (
  model: Model
): Generator<ConnectorNode> {
  for (const node of yieldNodes(model)) {
    if (isConnector(node)) {
      yield node;
    }
  }
};

export const findEndNode = (
  puzzle: Model,
  start: TerminalNode
): TerminalNode | null => {
  for (const node of yieldTerminalNodes(puzzle)) {
    if (node.id === start.id) {
      continue;
    }

    if (node.color === start.color) {
      return node;
    }
  }

  return null; // invalid model
};

export const yieldOutEdges = function* (
  model: Model,
  node: Node
): Generator<EdgeFull> {
  for (const edgeId in model.edgesOut[node.id]) {
    if (!isEdgeId(model, edgeId)) {
      continue;
    }

    const edge = toEdge(model, edgeId);

    if (!edge) {
      continue;
    }

    yield edge;
  }
};

export const yieldInEdges = function* (
  model: Model,
  node: Node
): Generator<EdgeFull> {
  for (const edgeId in model.edgesIn[node.id]) {
    if (!isEdgeId(model, edgeId)) {
      continue;
    }

    const edge = toEdge(model, edgeId);

    if (!edge) {
      continue;
    }

    yield edge;
  }
};

export const doesColoredPathExist = (
  model: Model,
  node: Node,
  target: TerminalNode,
  visited = new Set<NodeId>()
): boolean => {
  if (visited.has(node.id)) {
    return false;
  }

  visited.add(node.id);

  if (node.id === target.id) {
    return true;
  }

  for (const outEdge of yieldOutEdges(model, node)) {
    if (outEdge.color !== target.color) {
      continue;
    }

    if (doesColoredPathExist(model, outEdge.to, target, visited)) {
      return true;
    }
  }

  return false;
};
