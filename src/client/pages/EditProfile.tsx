import React, { useState } from "react";
import { Link } from "react-location";
import { Avatar, Button, PageBar, TextField } from "../components";

export const EditProfilePage = ({
  profile,
}: {
  profile: { avatarUrl?: string; displayName?: string };
}) => {
  const [displayName, setDisplayName] = useState(profile?.displayName);

  const isTouched = displayName !== profile?.displayName;

  return (
    <>
      {isTouched ? (
        <PageBar
          left="Save Changes?"
          right={
            <div className="flex">
              <Button
                className="p-0 mr-4"
                onClick={() => {
                  setDisplayName(profile?.displayName);
                }}
                text="Cancel"
              />
              <Button className="p-0" onClick={() => {}} text="Save" />
            </div>
          }
        />
      ) : (
        <PageBar center="Edit Profile" />
      )}

      <Avatar sx={{}} src={profile.avatarUrl} />
      <Link to="/profile/avatar/edit">
        <Button
          className="m-auto mt-2"
          text="Edit Avatar"
          // onClick={onEditAvatar}
        />
      </Link>

      <div className="p-4">
        <TextField
          id="displayName"
          value={displayName}
          onChange={setDisplayName}
          label="Display Name"
        />
      </div>
    </>
  );
};
