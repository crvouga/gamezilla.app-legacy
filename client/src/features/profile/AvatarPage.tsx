import React from "react";
import { Route, Routes } from "react-router-dom";
import {
  AvatarEditChoosePage,
  AvatarEditContext,
  AvatarEditMainPage,
} from "src/features";

export const AvatarPage = () => {
  return (
    <>
      <AvatarEditContext>
        <Routes>
          <Route path="/edit" element={<AvatarEditMainPage />} />
          <Route path="/edit/choose" element={<AvatarEditChoosePage />} />
        </Routes>
      </AvatarEditContext>
    </>
  );
};
