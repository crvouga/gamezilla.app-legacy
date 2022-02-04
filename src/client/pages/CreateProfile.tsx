import { Close } from "@mui/icons-material";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import {
  AppBar,
  Box,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import MobileStepper from "@mui/material/MobileStepper";
import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { Link } from "../components/Link";

export const CreateProfilePage = ({
  userId,
  userMetadata,
}: {
  userId: string;
  userMetadata: {
    name?: string;
  };
}) => {
  const theme = useTheme();

  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <>
      <AppBar>
        <Toolbar>
          <Link href="/logout">
            <IconButton edge="start">
              <Close />
            </IconButton>
          </Link>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Create Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, p: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          What's your name?
        </Typography>
        <TextField defaultValue={userMetadata.name} label="Name" />
      </Box>

      <MobileStepper
        variant="progress"
        steps={3}
        position="static"
        activeStep={activeStep}
        sx={{
          width: "100%",
        }}
        nextButton={
          <Button size="large" onClick={handleNext} disabled={activeStep === 3}>
            Next
            {theme.direction === "rtl" ? (
              <KeyboardArrowLeft />
            ) : (
              <KeyboardArrowRight />
            )}
          </Button>
        }
        backButton={
          <Button size="large" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === "rtl" ? (
              <KeyboardArrowRight />
            ) : (
              <KeyboardArrowLeft />
            )}
            Back
          </Button>
        }
      />
    </>
  );
};
