import {
  AnonymousClientCtx,
  ClientCtx,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Button,
  IconArrowLeftOnRect,
  IconSpinner,
  IconUserPen,
  Avatar,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { ModelClient, MsgClient } from "../profile.core";

export const ViewProfileScreen = ({
  model,
  ctx,
  userId,
  dispatch,
}: {
  ctx: ClientCtx | AnonymousClientCtx;
  userId: UserId;
  model: ModelClient;
  dispatch: (msg: MsgClient) => void;
}) => {
  const profile = model.profiles[userId];

  if (!profile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <IconSpinner className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (profile.userId === ctx.currentUserId) {
    return (
      <div className="h-full w-full">
        <TopBar title={profile.username} />

        <div className="flex flex-col items-center justify-center gap-4 overflow-x-hidden p-4">
          <Avatar
            className="h-28 w-28"
            src={profile.avatarUrl}
            alt="profile avatar"
          />
          <p className="w-full overflow-hidden text-ellipsis text-center text-3xl">
            @{profile.username}
          </p>
          <Button
            onClick={() => dispatch({ t: "clicked-edit-profile-button" })}
            className="w-full"
            start={<IconUserPen className="h-6 w-6" />}
            text="Edit Profile"
          ></Button>
          <Button
            onClick={() => dispatch({ t: "clicked-logout-button" })}
            className="w-full"
            start={<IconArrowLeftOnRect className="h-6 w-6" />}
            text="Logout"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() =>
              dispatch({
                t: "clicked-back-button",
                from: { t: "profile", userId: profile.userId },
              })
            }
          />
        }
        title={profile.username}
      />
      <div className="flex flex-col items-center justify-center gap-4 overflow-x-hidden p-4">
        <Avatar
          className="h-28 w-28"
          src={profile.avatarUrl}
          alt="profile avatar"
        />
        <p className="w-full overflow-hidden text-ellipsis text-center text-3xl">
          {profile.username}
        </p>
      </div>
    </div>
  );
};
