import { Cmd, Sub } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import { Route } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import * as ProfileStore from './profile-.store';

//
//
//
// Model
//
//
//

export type Model = null;

export const init = ({
  userId,
}: {
  userId: UserId;
}): [Model, Cmd<Msg>, OutAction[]] => [
  null,
  Cmd.None,
  [['Profile', ['FindMany', { userIds: [userId] }]]],
];

//
//
//
// Update
//
//
//

export type Msg =
  | ['ClickedBack']
  | ['ClickedSendMessage']
  | ['ClickedEditProfile']
  | ['ClickedAccountMenu'];

type OutAction = ProfileStore.Action;

export const update = (
  { currentUserId, userId }: { currentUserId: UserId; userId: UserId },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'ClickedBack': {
      return [model, Route.back, []];
    }

    case 'ClickedEditProfile': {
      return [model, Route.push(['ProfileUpdate']), []];
    }

    case 'ClickedAccountMenu': {
      return [model, Route.push(['Account']), []];
    }

    case 'ClickedSendMessage': {
      // const userIds = [userId, currentUserId];

      // const action: OutAction = [
      //   'Chat',
      //   ['Conversation', ['FindOneElseInsert', { userIds }]],
      // ];

      return [model, Cmd.None, []];
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const View = ({
  profileStore,
  // chatStore,
  currentUserId,
  userId,
  $send,
}: {
  // chatStore: ChatStore.Model;
  profileStore: ProfileStore.Model;
  currentUserId: UserId;
  userId: UserId;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const profile = profileStore.profiles[userId];

  if (!profile) {
    return (
      <UI.FillBox>
        <UI.Header title={'...'} />
        <UI.Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UI.CircularProgress />
        </UI.Box>
      </UI.FillBox>
    );
  }

  if (profile.userId === currentUserId) {
    return (
      <UI.FillBox>
        <UI.Header
          title={profile.username}
          right={
            <UI.IconButton
              edge="end"
              onClick={() => $send(['ClickedAccountMenu'])}
            >
              <UI.Icons.Menu />
            </UI.IconButton>
          }
        />

        <UI.Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            overflowX: 'hidden',
          }}
        >
          <UI.Avatar
            sx={{ width: 120, height: 120, marginBottom: 1 }}
            src={profile.avatarUrl}
          />
          <UI.Typography
            variant="h4"
            sx={{ maxWidth: '100%', marginBottom: 2 }}
            noWrap
          >
            {profile.username}
          </UI.Typography>
          <UI.Button
            fullWidth
            variant="contained"
            size="small"
            sx={{ marginBottom: 2 }}
            onClick={() => $send(['ClickedEditProfile'])}
          >
            Edit Profile
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    );
  }

  return (
    <UI.FillBox>
      <UI.Header
        left={<UI.HeaderBackButton onClick={() => $send(['ClickedBack'])} />}
        title={profile.username}
      />

      <UI.Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflowX: 'hidden',
          p: 2,
        }}
      >
        <UI.Avatar
          sx={{ width: 120, height: 120, marginBottom: 1 }}
          src={profile.avatarUrl}
        />
        <UI.Typography
          variant="h4"
          sx={{ maxWidth: '100%', marginBottom: 2 }}
          noWrap
        >
          {profile.username}
        </UI.Typography>

        {/* <UI.Button
          size="small"
          fullWidth
          variant="contained"
          sx={{ marginBottom: 2 }}
        >
          Send Friend Request
        </UI.Button> */}
        <UI.Button
          size="small"
          fullWidth
          // loading={
          //   chatStore.mutations.Conversation.FindElseInsert.type === 'Loading'
          // }
          variant="contained"
          onClick={() => $send(['ClickedSendMessage'])}
        >
          Send Message
        </UI.Button>
      </UI.Box>
    </UI.FillBox>
  );
};
