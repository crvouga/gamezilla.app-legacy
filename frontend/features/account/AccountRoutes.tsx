import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AccountIndex from "./Account";
import * as Account from "./account-state";
import AccountLogout from "./AccountLogout";

const AccountRoutes = ({
  state,
  dispatch,
}: {
  state: Account.IState;
  dispatch: (action: Account.IAction) => void;
}) => {
  return (
    <Routes>
      <Route path="/" element={<AccountIndex />} />
      <Route
        path="/logout"
        element={<AccountLogout state={state} dispatch={dispatch} />}
      />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default AccountRoutes;
