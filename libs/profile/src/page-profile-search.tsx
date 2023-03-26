import { Browser, Cmd, p, RemoteData } from '@gamezilla/core';
import { Route, UserId } from '@gamezilla/temp-shared';
import * as UI from '@gamezilla/temp-shared/ui';
import * as ProfileStore from './profile-store';

//
//
//
// Model
//
//
//

export type Model = {
  searchText: string;
};

export const init: [Model, Cmd<Msg>, OutAction[]] = [
  {
    searchText: '',
  },
  Cmd.None,
  [['profile', ['search', { searchText: '' }]]],
];

//
//
//
// Update
//
//
//

export type Msg =
  | ['ClickedClear']
  | ['focus-done', Browser.FocusResult]
  | ['InputtedSearchText', string]
  | ['clicked-result', { userId: UserId }];

export type OutAction = ProfileStore.Action;

const searchInputId = 'SearchInput';

export const update = (
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'focus-done':
      return [model, Cmd.None, []];

    case 'ClickedClear':
      return [
        { ...model, searchText: '' },
        p(
          Browser.focus(searchInputId),
          Cmd.perform((result) => ['focus-done', result])
        ),
        [],
      ];

    case 'clicked-result':
      return [model, Route.push(['profile', msg[1]]), []];

    case 'InputtedSearchText': {
      const searchTextNew = msg[1];
      return [
        { ...model, searchText: searchTextNew },
        Cmd.None,
        [['profile', ['search', { searchText: searchTextNew }]]],
      ];
    }
  }
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
  model,
  $send,
}: {
  profileStore: ProfileStore.Model;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const results = ProfileStore.toSearch(model.searchText, profileStore);
  const query = profileStore.search[model.searchText] ?? RemoteData.NotAsked;

  return (
    <UI.FillBox>
      <UI.InputBase
        sx={{ width: '100%', paddingY: 1, paddingX: 2 }}
        placeholder="Search"
        value={model.searchText}
        onChange={(event) => $send(['InputtedSearchText', event.target.value])}
        endAdornment={
          <UI.InputAdornment position="end">
            {query.type === 'Loading' && <UI.CircularProgress size={24} />}
            <UI.IconButton edge="end" onClick={() => $send(['ClickedClear'])}>
              <UI.Icons.Close />
            </UI.IconButton>
          </UI.InputAdornment>
        }
      />

      <UI.Divider />

      {results.length === 0 && (
        <UI.Typography sx={{ paddingX: 2 }} color="text.secondary">
          {query.type === 'Loading' ? 'Searching...' : 'No results found'}
        </UI.Typography>
      )}

      <UI.List sx={{ overflowY: 'scroll' }}>
        {results.map((result) => (
          <UI.ListItemButton
            key={result.userId}
            sx={{ width: '100%' }}
            onClick={() => $send(['clicked-result', { userId: result.userId }])}
          >
            <UI.ListItemAvatar>
              <UI.Avatar src={result.avatarUrl} />
            </UI.ListItemAvatar>
            <UI.ListItemText
              primaryTypographyProps={{ noWrap: true }}
              primary={result.username}
            />
            <UI.ListItemSecondaryAction>
              <UI.Icons.ChevronRight />
            </UI.ListItemSecondaryAction>
          </UI.ListItemButton>
        ))}
      </UI.List>
    </UI.FillBox>
  );
};
