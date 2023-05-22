import { SharedModel, toTurn } from './battleship.types';

describe('Battleship', () => {
  it('gets turn for count rule', () => {
    const model: SharedModel = {
      players: [],
      ships: [],
      shotRule: {
        t: 'count',
        count: 1,
      },
      shots: [
        {
          from: 'player-one',
          to: 'player-two',
          position: {
            x: 0,
            y: 0,
          },
        },
      ],
    };

    const turn = toTurn(model);

    expect(turn).toEqual('player-two');
  });
});
