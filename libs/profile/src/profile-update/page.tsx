import { Cmd } from '@gamezilla/core';
import { Alerts, Ctx, Route, UserId } from '@gamezilla/shared';
import { ProfileStore } from '..';
import { Profile } from '../profile-store';
import * as PageProfileUpdate from './page-profile-update';
import * as PageProfileUpdateAvatar from './page-profile-update-avatar';
import * as PageProfileUpdateName from './page-profile-update-name';
import * as PageProfileUpdateTheme from './page-profile-update-theme';
import * as PageProfileUpdateUsername from './page-profile-update-username';

//
//
//
//
//

export type Model =
  | {
      type: 'profile-update';
      child: PageProfileUpdate.Model;
    }
  | {
      type: 'profile-update-avatar';
      child: PageProfileUpdateAvatar.Model;
    }
  | {
      type: 'profile-update-name';
      child: PageProfileUpdateName.Model;
    }
  | {
      type: 'profile-update-theme';
      child: PageProfileUpdateTheme.Model;
    }
  | {
      type: 'profile-update-username';
      child: PageProfileUpdateUsername.Model;
    };

export const init = ({
  route,
  currentUserProfile,
}: {
  route: Route.Model;
  currentUserProfile: Profile;
}): Model => {
  switch (route[0]) {
    case 'profile-update':
      return {
        type: 'profile-update',
        child: PageProfileUpdate.init,
      };
    case 'profile-update-avatar':
      return {
        type: 'profile-update-avatar',
        child: PageProfileUpdateAvatar.init({
          avatarUrl: currentUserProfile.avatarUrl,
        }),
      };
    case 'profile-update-name':
      return {
        type: 'profile-update-name',
        child: PageProfileUpdateName.init({
          name: currentUserProfile.name,
        }),
      };
    case 'profile-update-theme':
      return {
        type: 'profile-update-theme',
        child: PageProfileUpdateTheme.init,
      };
    case 'profile-update-username':
      return {
        type: 'profile-update-username',
        child: PageProfileUpdateUsername.init({
          username: currentUserProfile.username,
        }),
      };

    default: {
      return {
        type: 'profile-update',
        child: PageProfileUpdate.init,
      };
    }
  }
};

//
//
//
//
//

export type Msg =
  | ['profile-update', PageProfileUpdate.Msg]
  | ['profile-update-avatar', PageProfileUpdateAvatar.Msg]
  | ['profile-update-name', PageProfileUpdateName.Msg]
  | ['profile-update-theme', PageProfileUpdateTheme.Msg]
  | ['profile-update-username', PageProfileUpdateUsername.Msg];

type OutAction = ProfileStore.Action | Alerts.Action;

export const update = ({
  msg,
  model,
  currentUserId,
}: {
  currentUserId: UserId;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  actions?: OutAction[];
} => {
  switch (msg[0]) {
    case 'profile-update': {
      if (model.type !== 'profile-update') {
        return { model };
      }
      const updated = PageProfileUpdate.update({
        msg: msg[1],
        model: model.child,
      });
      return {
        model: { ...model, child: updated.model },
        cmd: Cmd.tag('profile-update', updated.cmd ?? Cmd.None),
      };
    }

    case 'profile-update-avatar': {
      if (model.type !== 'profile-update-avatar') {
        return { model };
      }
      const updated = PageProfileUpdateAvatar.update({
        currentUserId,
        msg: msg[1],
        model: model.child,
      });
      return {
        model: { ...model, child: updated.model },
        cmd: Cmd.tag('profile-update-avatar', updated.cmd ?? Cmd.None),
        actions: updated.actions,
      };
    }

    case 'profile-update-name': {
      if (model.type !== 'profile-update-name') {
        return { model };
      }
      const updated = PageProfileUpdateName.update({
        currentUserId,
        msg: msg[1],
        model: model.child,
      });
      return {
        model: { ...model, child: updated.model },
        cmd: Cmd.tag('profile-update-name', updated.cmd ?? Cmd.None),
        actions: updated.actions,
      };
    }

    case 'profile-update-theme': {
      if (model.type !== 'profile-update-theme') {
        return { model };
      }
      const updated = PageProfileUpdateTheme.update({
        currentUserId,
        msg: msg[1],
        model: model.child,
      });
      return {
        model: { ...model, child: updated.model },
        cmd: Cmd.tag('profile-update-theme', updated.cmd ?? Cmd.None),
        actions: updated.actions,
      };
    }

    case 'profile-update-username': {
      if (model.type !== 'profile-update-username') {
        return { model };
      }
      const updated = PageProfileUpdateUsername.update({
        currentUserId,
        msg: msg[1],
        model: model.child,
      });
      return {
        model: { ...model, child: updated.model },
        cmd: Cmd.tag('profile-update-username', updated.cmd ?? Cmd.None),
        actions: updated.actions,
      };
    }
  }
};

//
//
// View
//
//

export const View = ({
  model,
  $send,
  currentUserProfile,
  ctx,
}: {
  ctx: Ctx;
  model: Model;
  currentUserProfile: Profile;
  $send: (m: Msg) => void;
}) => {
  switch (model.type) {
    case 'profile-update':
      return (
        <PageProfileUpdate.View
          ctx={ctx}
          model={model.child}
          $send={(m) => $send(['profile-update', m])}
        />
      );
    case 'profile-update-avatar':
      return (
        <PageProfileUpdateAvatar.View
          model={model.child}
          $send={(m) => $send(['profile-update-avatar', m])}
        />
      );
    case 'profile-update-name':
      return (
        <PageProfileUpdateName.View
          model={model.child}
          $send={(m) => $send(['profile-update-name', m])}
        />
      );
    case 'profile-update-theme':
      return (
        <PageProfileUpdateTheme.View
          profile={currentUserProfile}
          model={model.child}
          $send={(m) => $send(['profile-update-theme', m])}
        />
      );
    case 'profile-update-username':
      return (
        <PageProfileUpdateUsername.View
          model={model.child}
          $send={(m) => $send(['profile-update-username', m])}
        />
      );
  }
};
