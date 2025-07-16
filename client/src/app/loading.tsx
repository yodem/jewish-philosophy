import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function Loading() {
    return (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
            <CircularProgress color="primary" size={128} thickness={4} />
        </Box>
    );
}
