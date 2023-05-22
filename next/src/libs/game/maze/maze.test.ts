import { Maze } from './maze';
describe('Maze', () => {
  it('generates same maze for the same seed', () => {
    const seed = 'some arbitrary seed';
    const lower = { x: 0, y: 0 };
    const upper = { x: 10, y: 10 };

    const maze = Maze.make({ seed, upper, lower });

    for (let i = 0; i < 3; i++) {
      expect(maze).toEqual(Maze.make({ seed, upper, lower }));
    }
  });

  it('generates different maze for different seed', () => {
    const lower = { x: 0, y: 0 };
    const upper = { x: 10, y: 10 };

    const mazeA = Maze.make({ seed: 'foo', upper, lower });
    const mazeB = Maze.make({ seed: 'bar', upper, lower });

    expect(mazeA).not.toEqual(mazeB);
  });
});
