import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Account from "./Account";
import AccountLogout from "./AccountLogout";

const AccountRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Account />} />
      <Route path="/logout" element={<AccountLogout />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default AccountRoutes;
