import { Cmd, p } from '@gamezilla/core';
import { Alerts, ProfileAvatar, Route, UserId } from '@gamezilla/shared';
import * as UI from '@gamezilla/ui';
import * as ProfileStore from './profile.store';

//
//
//
// Model
//
//
//

export type Model = {
  status: 'Idle' | 'GeneratingSeed' | 'StyleSelectOpened' | 'UpdatingAvatar';
  seed: ProfileAvatar.Seed;
  style: ProfileAvatar.Style;
};

export const init = ({ avatarUrl }: { avatarUrl: string }): Model => {
  const { seed, style } = ProfileAvatar.parseUrl(avatarUrl);

  return {
    status: 'Idle',
    seed,
    style,
  };
};

//
//
//
// Update
//
//
//

export type Msg =
  | ['ClickedCancel']
  | ['ClickedDone']
  | ['StyleSelectClosed']
  | ['StyleSelectOpened']
  | ['ClickedRandomSeed']
  | ['ClickedStyle', ProfileAvatar.Style]
  | ['InputtedSeed', ProfileAvatar.Seed]
  | ['RandomSeedGenerated', ProfileAvatar.Seed];

type OutAction = Alerts.Action | ProfileStore.Action;

export const update = (
  { userId }: { userId: UserId },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'ClickedCancel':
      return [model, Route.back, []];

    case 'StyleSelectClosed':
      return [{ ...model, status: 'Idle' }, Cmd.None, []];

    case 'StyleSelectOpened':
      return [{ ...model, status: 'StyleSelectOpened' }, Cmd.None, []];

    case 'InputtedSeed':
      return [{ ...model, seed: msg[1] }, Cmd.None, []];

    case 'ClickedRandomSeed':
      return [
        { ...model, status: 'GeneratingSeed' },
        p(
          ProfileAvatar.generateRandomSeed,
          Cmd.perform((seed) => ['RandomSeedGenerated', seed])
        ),
        [],
      ];

    case 'RandomSeedGenerated':
      return [{ ...model, status: 'Idle', seed: msg[1] }, Cmd.None, []];

    case 'ClickedStyle':
      return [{ ...model, style: msg[1] }, Cmd.None, []];

    case 'ClickedDone':
      return [
        model,
        Route.back,
        [
          [
            'Profile',
            [
              'EditOne',
              { userId, edits: { avatarUrl: ProfileAvatar.toUrl(model) } },
            ],
          ],
        ],
      ];
  }
};

//
//
//
// Update
//
//
//

export const View = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <UI.FillBox>
      <UI.Header
        left={
          <UI.Button
            sx={{ marginLeft: -1 }}
            onClick={() => $send(['ClickedCancel'])}
          >
            Cancel
          </UI.Button>
        }
        title="Avatar"
        right={
          <UI.Button
            sx={{ marginRight: -1 }}
            onClick={() => $send(['ClickedDone'])}
          >
            Done
          </UI.Button>
        }
      />

      <UI.Avatar
        src={ProfileAvatar.toUrl(model)}
        sx={{
          marginX: 'auto',
          width: '150px',
          height: '150px',
          marginBottom: 1,
        }}
      />

      <UI.LoadingDialog
        open={model.status === 'UpdatingAvatar'}
        title="Updating avatar..."
      />

      <UI.Box sx={{ padding: 2 }}>
        <UI.Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Style
        </UI.Typography>
        <UI.Select
          sx={{ marginBottom: 2 }}
          open={model.status === 'StyleSelectOpened'}
          fullWidth
          value={model.style}
          onOpen={() => $send(['StyleSelectOpened'])}
          onClose={() => $send(['StyleSelectClosed'])}
          renderValue={(style) => (
            <UI.Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <UI.Avatar
                sx={{ marginRight: 1, width: 24, height: 24 }}
                src={ProfileAvatar.toUrl({
                  style,
                  seed: ProfileAvatar.toSeed(model.seed),
                })}
              />
              <UI.Typography>{ProfileAvatar.formatStyle(style)}</UI.Typography>
            </UI.Box>
          )}
        >
          {ProfileAvatar.ALL_STYLES.map((style) => (
            <UI.MenuItem
              key={style}
              value={style}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onClick={() => $send(['ClickedStyle', style])}
            >
              <UI.Avatar
                sx={{ marginRight: 1 }}
                src={ProfileAvatar.toUrl({
                  style,
                  seed: ProfileAvatar.toSeed(model.seed),
                })}
              />
              <UI.Typography>{ProfileAvatar.formatStyle(style)}</UI.Typography>
            </UI.MenuItem>
          ))}
        </UI.Select>

        <UI.Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Seed
        </UI.Typography>

        <UI.TextField
          fullWidth
          value={model.seed}
          onChange={(event) =>
            $send([
              'InputtedSeed',
              ProfileAvatar.toSeed(event.currentTarget.value),
            ])
          }
          sx={{ marginBottom: 2 }}
        />

        <UI.Button
          loading={model.status === 'GeneratingSeed'}
          fullWidth
          variant="outlined"
          onClick={() => $send(['ClickedRandomSeed'])}
          sx={{ marginBottom: 4 }}
        >
          Random Seed
        </UI.Button>
      </UI.Box>
    </UI.FillBox>
  );
};
