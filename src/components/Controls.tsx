import { useRef } from 'react';
import type { Filter } from '../model/Filter';
import { useIntent } from '../model/appSlice';
import { Box, TextField, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

function Controls() {
    const intent = useIntent();
    const inputRef = useRef<HTMLInputElement>(null);
    const filter = useSelector((state: RootState) => state.app.filter);

    const handleFilterChange = (_: React.MouseEvent<HTMLElement>, value: Filter | null) => {
        if (value !== null) intent.changeFilter(value);
    };

    const onClickAddButton = async () => {
        const value = inputRef.current?.value;
        if (value !== undefined && value.trim() !== '') {
            const result = await intent.addTodo(value);
            if ('data' in result && inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onClickAddButton();
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    inputRef={inputRef}
                    placeholder="할 일을 입력하세요..."
                    size="small"
                    fullWidth
                    onKeyDown={handleKeyDown}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <Button
                    variant="contained"
                    onClick={onClickAddButton}
                    startIcon={<AddRoundedIcon />}
                    sx={{ borderRadius: 3, whiteSpace: 'nowrap', px: 2.5, boxShadow: 'none' }}
                >
                    추가
                </Button>
            </Box>
            <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={handleFilterChange}
                size="small"
                fullWidth
                sx={{
                    '& .MuiToggleButton-root': {
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        py: 0.5,
                    },
                    '& .MuiToggleButton-root.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                    },
                }}
            >
                <ToggleButton value="all">전체</ToggleButton>
                <ToggleButton value="active">할일</ToggleButton>
                <ToggleButton value="completed">완료</ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}

export default Controls;
