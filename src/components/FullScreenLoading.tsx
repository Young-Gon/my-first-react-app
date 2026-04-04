import { Box, CircularProgress, Typography } from '@mui/material';

export default function FullScreenLoading() {
    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                bgcolor: 'background.default',
            }}
        >
            <CircularProgress size={48} color="primary" />
            <Typography variant="body2" color="text.secondary">불러오는 중...</Typography>
        </Box>
    );
}
