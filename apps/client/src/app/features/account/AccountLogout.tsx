import { LoadingButton } from '@mui/lab';
import { Box, Button, Drawer, Typography } from '@mui/material';
import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { logout } from './account-data-access';

const Logout = () => {
  const navigate = useNavigate();

  const mutation = useMutation(logout, {
    onSuccess: () => {
      navigate('/', { replace: true });
    },
  });

  const onConfirm = () => {
    mutation.mutate();
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <Drawer open anchor="bottom" onBackdropClick={onCancel}>
      <Typography sx={{ p: 2 }} align="center" variant="h5">
        Logout of Gamezilla?
      </Typography>

      <Box
        sx={{
          width: '100%',
          p: 2,
          display: 'flex',
        }}
      >
        <Button
          variant="outlined"
          sx={{ flex: 1, marginRight: 2 }}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <LoadingButton
          sx={{ flex: 1 }}
          variant="contained"
          loading={mutation.status === 'loading'}
          size="large"
          onClick={onConfirm}
        >
          Logout
        </LoadingButton>
      </Box>
    </Drawer>
  );
};

export default Logout;
