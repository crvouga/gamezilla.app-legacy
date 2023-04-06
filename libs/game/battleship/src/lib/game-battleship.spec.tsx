import { render } from '@testing-library/react';

import GameBattleship from './game-battleship';

describe('GameBattleship', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GameBattleship />);
    expect(baseElement).toBeTruthy();
  });
});
