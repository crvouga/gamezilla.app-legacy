import { ChevronLeft } from "@mui/icons-material";
import { IconButton, IconButtonProps } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const BackButton = (props: IconButtonProps) => {
  const navigate = useNavigate();
  return (
    <IconButton
      edge="start"
      onClick={() => {
        navigate(-1);
      }}
      {...props}
    >
      <ChevronLeft />
    </IconButton>
  );
};
