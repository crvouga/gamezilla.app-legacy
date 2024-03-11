import { Namespace } from "gamezilla-app/@SHARED/msg"
import { UserId } from "../../@SHARED/data"

const Msg = Namespace("profile")

export const ProfileRoutes = {
  Profile: Msg<{ userId: UserId }>("profile"),
  ProfileEdit: Msg("profile-edit"),
  ProfileEditAvatar: Msg("profile-edit-avatar"),
  ProfileEditUsername: Msg("profile-edit-username"),
}
