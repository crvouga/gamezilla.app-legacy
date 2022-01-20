import React from "react";
import { Avatar } from "../../Components/Avatar";
import { Button } from "../../Components/Button";
import { PageBar } from "../../Components/PageBar";
import { Link, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { TextField } from "../../Components/TextField";

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
          className="justify-between"
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
        <PageBar center="Edit Avatar" />
      )}

      <Avatar className="w-36 h-36 m-auto mt-4" src={profile.avatarUrl} />
      <Link to="/edit/profile/avatar">
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
