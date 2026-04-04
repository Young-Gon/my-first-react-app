import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

interface Props {
    onRetry: () => void;
}

export default function FullScreenError({ onRetry }: Props) {
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
            <ErrorOutlineRoundedIcon sx={{ fontSize: 56, color: 'error.main' }} />
            <Typography variant="body1" color="text.secondary">
                데이터를 불러오지 못했습니다.
            </Typography>
            <Button variant="outlined" color="error" onClick={onRetry} sx={{ borderRadius: 3 }}>
                다시 시도
            </Button>
        </Box>
    );
}
