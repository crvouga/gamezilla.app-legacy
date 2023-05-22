import { render } from '@testing-library/react';

import GameMinesweeper from './game-minesweeper';

describe('GameMinesweeper', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GameMinesweeper />);
    expect(baseElement).toBeTruthy();
  });
});
