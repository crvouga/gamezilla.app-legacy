import { PageBar } from "Components/PageBar";
import React, { useState } from "react";

export const SearchUsersPage = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <>
      <input
        onChange={(event) => setInputValue(event.currentTarget.value)}
        className="w-full p-4 border-b"
        placeholder="Search Users"
      />
    </>
  );
};
