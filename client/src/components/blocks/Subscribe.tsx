"use client";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

export default function Subscribe({ headline, content, formAction, buttonText, errorMessage, successMessage }: any) {
  return (
    <Box width={{ xs: '100%', md: '50%' }} px={3} py={6} bgcolor="background.paper" borderRadius={2} boxShadow={2} display="flex" flexDirection="column" alignItems="center" gap={4}>
      <Box flex={1} mb={3} width="100%">
        <Typography variant="h5" fontWeight={600} gutterBottom>{headline}</Typography>
        <Typography color="text.secondary">{content}</Typography>
      </Box>
      <Box component="form" action={formAction} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="stretch" gap={2} width="100%">
        <TextField name="email" type="email" label="Email" variant="outlined" required fullWidth />
        <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 120 }}>{buttonText}</Button>
      </Box>
      {errorMessage && <Alert severity="error" sx={{ width: '100%' }}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" sx={{ width: '100%' }}>{successMessage}</Alert>}
    </Box>
  );
}
