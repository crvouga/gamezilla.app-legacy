import React from "react";

export const LoadingDialog = ({
  visible,
  title,
}: {
  visible: boolean;
  title: string;
}) => {
  return (
    <div>
      <div>
        <div />
        <h1 style={{ textAlign: "center" }}>{title}</h1>
      </div>
    </div>
  );
};
