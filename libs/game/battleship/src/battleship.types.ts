import { Result } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';

//
//
// Model
//
//

type Team = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export type SharedModel = {
  players: {
    [key in Team]: Player;
  };
  ships: {
    [key in Team]: null;
  };
};

type ShipType =
  | 'Carrier'
  | 'Battleship'
  | 'Cruiser'
  | 'Submarine'
  | 'Destroyer';

export const shipTypeToLength: { [key in ShipType]: number } = {
  Carrier: 5,
  Battleship: 4,
  Cruiser: 3,
  Submarine: 3,
  Destroyer: 2,
};

type Player =
  | {
      type: 'User';
      userId: UserId;
    }
  | {
      type: 'Bot';
      level: BotLevel;
    };

type BotLevel = 'Easy' | 'Medium' | 'Hard';

//
//
// Msg
//
//

export type Req =
  | { t: 'start-playing'; team: Team }
  | { t: 'stop-playing'; team: Team }
  | { t: 'fire'; team: Team; x: number; y: number };

export type Res = Req & { result: Result<Problem, SharedModel> };

type Problem = 'unknown';
