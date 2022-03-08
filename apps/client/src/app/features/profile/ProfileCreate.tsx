import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import {
  AppBar,
  Box,
  Button,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { createProfile } from './profile-data-access';
import { generateRandomAvatarSeed, toAvatarUrl } from './ProfileUpdateAvatar';

const ProfileCreate = ({
  userId,
  defaultName,
}: {
  userId: string;
  defaultName: string;
}) => {
  const mutation = useMutation(createProfile);
  const [name, setName] = useState(defaultName);
  const [username, setUsername] = useState(
    name.replace(' ', '').toLowerCase() ?? ''
  );

  const onCreate = () => {
    mutation.mutate({
      userId,
      name,
      username,
      avatarUrl: toAvatarUrl('croodles-neutral', generateRandomAvatarSeed()),
    });
  };

  const navigate = useNavigate();

  const onCancel = () => {
    navigate('/logout', { replace: true });
  };

  const back = () => {
    navigate(-1);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout
            title="What's your name?"
            backButtonProps={{
              children: 'Cancel',
              onClick: onCancel,
            }}
            nextButtonProps={{
              children: 'Next',

              onClick: () => {
                navigate('2');
              },
            }}
          >
            <TextField
              sx={{ marginBottom: 2 }}
              value={name}
              onChange={(event) => {
                setName(event.currentTarget.value);
              }}
              label="Name"
            />
          </Layout>
        }
      />
      <Route
        path="/2"
        element={
          <Layout
            title="What's your username?"
            backButtonProps={{
              children: 'Back',
              onClick: back,
            }}
            nextButtonProps={{
              children: 'Done',
              loading: mutation.isLoading,
              onClick: onCreate,
            }}
          >
            <TextField
              sx={{ marginBottom: 2 }}
              value={username}
              onChange={(event) => {
                setUsername(event.currentTarget.value);
              }}
              label="Username"
            />
          </Layout>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const Layout = ({
  children,
  title,
  backButtonProps,
  nextButtonProps,
}: {
  title: string;
  backButtonProps?: LoadingButtonProps;
  nextButtonProps?: LoadingButtonProps;
  children: React.ReactNode;
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar>
        <Toolbar>
          <Typography align="center" variant="h5" sx={{ flex: 1 }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          p: 2,
          flex: 1,
        }}
      >
        {children}
      </Box>

      <Box sx={{ display: 'flex', p: 2 }}>
        <Button
          variant="outlined"
          sx={{ flex: 1, marginRight: 2 }}
          {...backButtonProps}
        />
        <LoadingButton
          sx={{ flex: 1 }}
          fullWidth
          variant="contained"
          size="large"
          type="submit"
          {...nextButtonProps}
        />
      </Box>
    </Box>
  );
};

export default ProfileCreate;
