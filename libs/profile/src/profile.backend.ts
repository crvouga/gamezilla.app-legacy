import { Cmd, Sub } from '@gamezilla/core';
import { BackendModel, BackendMsg, Req, ToBackend } from './profile.types';

//
//
//
// model
//
//
//

export type Model = BackendModel;

export const init: [Model, Cmd<Msg>] = [null, Cmd.None];

//
//
//
// update
//
//
//

export type Msg = BackendMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model } => {
  switch (msg[0]) {
    case 'none': {
      return { model };
    }
  }
};

export const updateFromFrontend = ({
  msg,
  model,
}: // database,
{
  msg: ToBackend;
  model: Model;
  // database: Database;
}): { model: Model; cmd: Cmd<Msg> } => {
  switch (msg[0]) {
    default: {
      return {
        model,
        cmd: () => {
          //
        },
      };
    }
  }
};

// type Database = (req: Req) => Promise<Res>;

// const handler = (): Database => async (req) => {
//   switch (req[0]) {
//     case 'find_many': {
//       const userIds = req[1].userId.map((x) => `'${x}'`).join(',');

//       const found =
//       if (found.type === 'Err') {
//         return found;
//       }
//       const Row = z.object({
//         userId: z.string(),
//         username: z.string(),
//         avatarUrl: z.string(),
//         themeMode: z.enum(['Light', 'Dark', 'System']),
//       });
//       const decoded = found.value.rows.map((x) => Row.parse(x));
//       return ['find_many', req[1], Result.Ok(decoded)];
//     }

//     case 'search': {
//       const { rows } = await pg.query(
//         `SELECT * FROM profile WHERE username LIKE '%${req[1].query}%'`
//       );
//       return ['search', req[1], Result.Ok(rows)];
//     }
//   }
// };

export const msgToQuery = (msg: Req) => {
  switch (msg[0]) {
    case 'find_many': {
      const userIds = msg[1].userId.map((x) => `'${x}'`).join(',');
      return `SELECT * FROM profile WHERE user_id IN (${userIds})`;
    }

    case 'search': {
      return `SELECT * FROM profile WHERE username LIKE '%${msg[1].query}%'`;
    }
  }
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
