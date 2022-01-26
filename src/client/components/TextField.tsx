import React from "react";
import MuiTextField from "@mui/material/TextField";
export const TextField = ({
  value,
  label,
  onChange,
  placeholder,
  id,
}: {
  id?: string;
  label?: string;
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
}) => {
  return (
    <MuiTextField
      id={id}
      label={label}
      onChange={
        onChange
          ? (event) => {
              onChange(event?.currentTarget?.value ?? "");
            }
          : undefined
      }
    />
  );
};
