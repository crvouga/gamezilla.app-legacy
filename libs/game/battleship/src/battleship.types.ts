import { UserId } from '@gamezilla/shared';

type Team = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export type Model = {
  players: {
    [key in Team]: Player;
  };
  //   ships: {
  //     [key in Team]: Ship[];
  //   };
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
