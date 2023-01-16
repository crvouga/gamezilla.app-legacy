import { gameConnectFour } from './game-connect-four';

describe('gameConnectFour', () => {
  it('should work', () => {
    expect(gameConnectFour()).toEqual('game-connect-four');
  });
});
