import { Box, Container } from '@mui/material';

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
            <Container maxWidth="sm">
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 4,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                        p: { xs: 3, sm: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}
                >
                    {children}
                </Box>
            </Container>
        </Box>
    );
}

export default Layout;
