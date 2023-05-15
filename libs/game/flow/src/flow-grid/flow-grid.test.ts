import { fromShorthand } from './flow-grid-shorthand';
import { Flow, Color } from '../flow';
import { positionToId } from './flow-grid';
import { p } from '@gamezilla/shared/core';

const model = fromShorthand([
  ['🟡', null, null],
  [null, null, null],
  [null, null, '🟡'],
]);

describe('flow-grid', () => {
  it('path start is null before path init', () => {
    const pathStart = Flow.findPathStart(model, Color.fromEmoji('🟡'));
    expect(pathStart).toEqual(null);
  });
  it('should init path start', () => {
    const startNode: Flow.TerminalNode = {
      color: Color.fromEmoji('🟡'),
      id: positionToId({ x: 0, y: 0 }),
    };
    const modelNew = Flow.initPath(model, startNode);
    const pathStart = Flow.findPathStart(modelNew, Color.fromEmoji('🟡'));
    expect(pathStart).toEqual(startNode.id);
  });
  it('should extend path', () => {
    const startNode: Flow.TerminalNode = {
      color: Color.fromEmoji('🟡'),
      id: positionToId({ x: 0, y: 0 }),
    };

    const modelNew = p(
      Flow.initPath(model, startNode),
      (m) =>
        Flow.extendPath(m, Color.fromEmoji('🟡'), positionToId({ x: 0, y: 1 })),
      (m) =>
        Flow.extendPath(m, Color.fromEmoji('🟡'), positionToId({ x: 0, y: 2 }))
    );

    const actualEndId = Flow.findPathEnd(
      modelNew,
      Color.fromEmoji('🟡'),
      startNode.id
    );

    const expectedEndId = positionToId({ x: 0, y: 2 });

    expect(actualEndId).toEqual(expectedEndId);
  });
});
