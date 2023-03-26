import { Cmd, exhaustive, Keyboard, p, RemoteData, Sub } from '@gamezilla/core';
import { ProfileStore } from '@gamezilla/profile';
import { Ctx, Route, UserId } from '@gamezilla/temp-shared';
import * as UI from '@gamezilla/temp-shared/ui';
import { useEffect, useRef } from 'react';
import * as ChatStore from './chat.store';

//
//
//
// Model
//
//
//

export type Model = {
  searchText: string;
  selected: { [userId: UserId]: UserId };
  highlightedIndex: 'none' | number;
};

//
//
//
// Init
//
//
//

export const init = (): [Model, Cmd<Msg>, OutAction[]] => {
  const searchText = '';
  return [
    {
      searchText,
      selected: {},
      highlightedIndex: 'none',
    },
    Cmd.None,
    [['profile', ['search', { searchText }]]],
  ];
};

//
//
//
// Update
//
//
//

export type Msg =
  | ['clicked-cancel']
  | ['ClickedChat']
  | ['InputtedSearch', string]
  | ['clicked-result', { userId: UserId }]
  | ['ClickedSelectedDelete', { userId: UserId }]
  | ['PressedKeyDown', Keyboard.ArrowKey | Keyboard.EnterKey];

export type OutAction = ProfileStore.Action | ChatStore.Action;

export const update = (
  {
    currentUserId,
    profileStore,
  }: { currentUserId: UserId; profileStore: ProfileStore.Model },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'ClickedChat': {
      const userIds = [...Object.values(model.selected), currentUserId];

      const action: OutAction = [
        'chat',
        ['conversation', ['FindOneElseInsert', { userIds }]],
      ];

      return [model, Cmd.None, [action]];
    }

    case 'clicked-cancel':
      return [model, Route.back, []];

    case 'InputtedSearch': {
      const searchText = msg[1];
      return [
        {
          ...model,
          searchText,
          highlightedIndex: 'none',
        },
        Cmd.None,
        [['profile', ['search', { searchText }]]],
      ];
    }

    case 'ClickedSelectedDelete': {
      const selectedNew = removeKey(msg[1].userId, model.selected);
      return [{ ...model, selected: selectedNew }, Cmd.None, []];
    }

    case 'PressedKeyDown': {
      const profiles = ProfileStore.toSearch(model.searchText, profileStore);

      switch (msg[1]) {
        case 'ArrowDown':
          return [
            {
              ...model,
              highlightedIndex:
                model.highlightedIndex === 'none'
                  ? 0
                  : circularIndex(model.highlightedIndex + 1, profiles.length),
            },
            Cmd.None,
            [],
          ];

        case 'ArrowUp':
          return [
            {
              ...model,
              highlightedIndex:
                model.highlightedIndex === 'none'
                  ? 0
                  : circularIndex(model.highlightedIndex - 1, profiles.length),
            },
            Cmd.None,
            [],
          ];

        case 'Enter': {
          if (model.highlightedIndex === 'none') {
            return [model, Cmd.None, []];
          }

          const profile = profiles[model.highlightedIndex];

          if (!profile) {
            return [model, Cmd.None, []];
          }

          return toggleSelected(profile.userId, model);
        }

        case 'ArrowLeft':
        case 'ArrowRight':
          return [model, Cmd.None, []];

        default:
          return [model, Cmd.None, []];
      }
    }

    case 'clicked-result': {
      const [modelNew, cmdNew, actions] = toggleSelected(msg[1].userId, model);
      return [{ ...modelNew, highlightedIndex: 'none' }, cmdNew, actions];
    }

    default:
      return exhaustive(msg[0]);
  }
};

const toggleSelected = (
  userId: UserId,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  if (userId in model.selected) {
    return [
      {
        ...model,
        searchText: '',
        selected: removeKey(userId, model.selected),
      },
      Cmd.None,
      [],
    ];
  }

  return [
    {
      ...model,
      searchText: '',
      selected: {
        ...model.selected,
        [userId]: userId,
      },
    },
    Cmd.None,
    [],
  ];
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model) => {
  return p(
    Keyboard.keyDowns((key) => key),
    Sub.chain((key) =>
      Keyboard.isArrowKey(key) || Keyboard.isEnterKey(key)
        ? Sub.of(key)
        : Sub.None
    ),
    Sub.map((key): Msg => ['PressedKeyDown', key])
  );
};

//
//
//
// View
//
//
//

export const View = ({
  chatStore,
  ctx,
  $send,
  model,
  profileStore,
}: {
  ctx: Ctx;
  profileStore: ProfileStore.Model;
  chatStore: ChatStore.Model;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const mutation = chatStore.mutations.Conversation.FindElseInsert;

  const searchQuery =
    profileStore.search[model.searchText] ?? RemoteData.NotAsked;

  const profiles = ProfileStore.toSearch(model.searchText, profileStore).filter(
    (profile) => profile.userId !== ctx.currentUserId
  );

  const selected = Object.values(model.selected).flatMap((userId) => {
    const profile = profileStore.profiles[userId];
    if (profile) {
      return [profile];
    }
    return [];
  });
  return (
    <UI.FillBox>
      <UI.Header
        left={<UI.HeaderBackButton onClick={() => $send(['clicked-cancel'])} />}
        title="New message"
        right={
          <UI.Button
            size="large"
            disabled={Object.values(model.selected).length === 0}
            sx={{ marginRight: -1 }}
            onClick={() => $send(['ClickedChat'])}
            loading={mutation.type === 'Loading'}
          >
            Chat
          </UI.Button>
        }
      />

      <UI.Typography variant="h6" sx={{ fontWeight: 'bold', paddingX: 2 }}>
        To
      </UI.Typography>

      <UI.Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          paddingBottom: 2,
          paddingTop: 1,
          overflowX: 'scroll',
        }}
      >
        {selected.map((profile) => (
          <UI.Chip
            sx={{ marginLeft: 1 }}
            key={profile.userId}
            label={profile.username}
            onDelete={() => {
              $send([
                'ClickedSelectedDelete',
                {
                  userId: profile.userId,
                },
              ]);
            }}
          />
        ))}
        <UI.InputBase
          sx={{ paddingX: 2, flex: 1 }}
          autoFocus
          placeholder={selected.length === 0 ? 'search' : ''}
          value={model.searchText}
          onChange={(event) => {
            const searchText = event.currentTarget.value;
            $send(['InputtedSearch', searchText]);
          }}
        />
      </UI.Box>

      <UI.Divider />

      <UI.List sx={{ overflowY: 'scroll', flex: 1 }}>
        {searchQuery.type === 'Ok' && profiles.length === 0 && (
          <UI.Typography sx={{ p: 2 }} color="text.secondary">
            No account found.
          </UI.Typography>
        )}

        {profiles.map((profile, index) => (
          <SearchResultListItem
            key={profile.userId}
            profile={profile}
            onClick={() => {
              $send([
                'clicked-result',
                {
                  userId: profile.userId,
                },
              ]);
            }}
            selected={profile.userId in model.selected}
            highlighted={
              model.highlightedIndex !== 'none' &&
              circularIndex(model.highlightedIndex, profiles.length) === index
            }
          />
        ))}

        {searchQuery.type === 'Loading' && (
          <UI.Box
            sx={{
              width: '100%',
              p: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <UI.CircularProgress />
          </UI.Box>
        )}
      </UI.List>
    </UI.FillBox>
  );
};

const SearchResultListItem = ({
  profile: searchResult,
  onClick,
  highlighted,
  selected,
}: {
  highlighted: boolean;
  selected: boolean;
  profile: ProfileStore.Profile;
  onClick: () => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [highlighted]);
  return (
    <div ref={ref}>
      <UI.ListItemButton
        id={searchResult.userId}
        selected={highlighted}
        key={searchResult.userId}
        onMouseDown={onClick}
      >
        <UI.ListItemAvatar>
          <UI.Avatar src={searchResult.avatarUrl} />
        </UI.ListItemAvatar>
        <UI.ListItemText
          primary={searchResult.username}
          secondary={searchResult.name}
        />

        <UI.ListItemSecondaryAction>
          <UI.Checkbox checked={selected} />
        </UI.ListItemSecondaryAction>
      </UI.ListItemButton>
    </div>
  );
};

//
//
//
// Helpers
//
//
//

const removeKey = <T,>(key: keyof T, a: T): Omit<T, keyof T> => {
  const { [key]: _value, ...rest } = a;
  return rest;
};

const circularIndex = (index: number, length: number): number => {
  return ((index % length) + length) % length;
};
