import { render } from '@testing-library/react';

import SharedFrontend from './shared-frontend';

describe('SharedFrontend', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedFrontend />);
    expect(baseElement).toBeTruthy();
  });
});
