import { Typography, Box } from '@mui/material';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';

export default function Title() {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ChecklistRoundedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
            <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                    background: 'linear-gradient(90deg, #5c6bc0 0%, #7986cb 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                }}
            >
                To-do List
            </Typography>
        </Box>
    );
}
