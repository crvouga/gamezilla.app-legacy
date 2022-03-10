import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AccountIndex from "./AccountIndex";
import AccountLogout from "./AccountLogout";

const Account = () => {
  return (
    <Routes>
      <Route path="/" element={<AccountIndex />} />
      <Route path="/logout" element={<AccountLogout />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default Account;
