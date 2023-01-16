import { render } from '@testing-library/react';

import GameShared from './game-shared';

describe('GameShared', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GameShared />);
    expect(baseElement).toBeTruthy();
  });
});
