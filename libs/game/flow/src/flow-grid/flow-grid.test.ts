import { p } from '@gamezilla/shared/core';
import { Flow, FlowAlgoPath } from '../flow';
import { positionToId } from './flow-grid';
import { fromShorthand } from './flow-grid-shorthand';

const model = fromShorthand([
  ['A', null, null],
  [null, null, null],
  [null, null, 'A'],
]);

describe('flow-grid', () => {
  it('path start is null before path init', () => {
    const pathStart = FlowAlgoPath.findGroupStart(model, 'A');
    expect(pathStart).toEqual(null);
  });
  it('should init path start', () => {
    const startNode: Flow.TerminalNode = {
      groupId: 'A',
      id: positionToId({ x: 0, y: 0 }),
    };
    const modelNew = FlowAlgoPath.startPath(model, startNode);
    const pathStart = FlowAlgoPath.findGroupStart(modelNew, 'A');
    expect(pathStart).toEqual(startNode.id);
  });
  it('should extend path', () => {
    const startNode: Flow.TerminalNode = {
      groupId: 'A',
      id: positionToId({ x: 0, y: 0 }),
    };

    const modelNew = p(
      FlowAlgoPath.startPath(model, startNode),
      (m) => FlowAlgoPath.extendPath(m, 'A', positionToId({ x: 0, y: 1 })),
      (m) => FlowAlgoPath.extendPath(m, 'A', positionToId({ x: 0, y: 2 }))
    );

    const actualEndId = FlowAlgoPath.findGroupEnd(modelNew, 'A', startNode.id);

    const expectedEndId = positionToId({ x: 0, y: 2 });

    expect(actualEndId).toEqual(expectedEndId);
  });
});
