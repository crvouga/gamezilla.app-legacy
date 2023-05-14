import { emojiToColor, fromShorthand } from './flow-grid-shorthand';
import { Flow } from '../flow';
import { positionToId } from './flow-grid';
import { p } from '@gamezilla/shared/core';

const model = fromShorthand([
  ['🟡', null, null],
  [null, null, null],
  [null, null, '🟡'],
]);

describe('flow-grid', () => {
  it('path start is null before path init', () => {
    const pathStart = Flow.findPathStart(model, emojiToColor('🟡'));
    expect(pathStart).toEqual(null);
  });
  it('should init path start', () => {
    const startNode: Flow.TerminalNode = {
      color: emojiToColor('🟡'),
      id: positionToId({ x: 0, y: 0 }),
    };
    const modelNew = Flow.initPath(model, startNode);
    const pathStart = Flow.findPathStart(modelNew, emojiToColor('🟡'));
    expect(pathStart).toEqual(startNode.id);
  });
  it('should extend path', () => {
    const startNode: Flow.TerminalNode = {
      color: emojiToColor('🟡'),
      id: positionToId({ x: 0, y: 0 }),
    };

    const modelNew = p(
      Flow.initPath(model, startNode),
      (m) =>
        Flow.extendPath(m, emojiToColor('🟡'), positionToId({ x: 0, y: 1 })),
      (m) =>
        Flow.extendPath(m, emojiToColor('🟡'), positionToId({ x: 0, y: 2 }))
    );

    const actualEndId = Flow.findPathEnd(
      modelNew,
      emojiToColor('🟡'),
      startNode.id
    );

    const expectedEndId = positionToId({ x: 0, y: 2 });

    expect(actualEndId).toEqual(expectedEndId);
  });
});
