import { useState } from 'react';
import { useIntent } from '../model/appSlice';
import type { Todo } from '../model/Todo';
import {
    ListItem, Checkbox, Typography, TextField,
    IconButton, Box, Divider,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function TodoItem({ todo }: { todo: Todo }) {
    const intent = useIntent();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const handleEdit = async () => {
        if (isEditing) {
            const result = await intent.editTodo(todo.id, editText);
            if ('data' in result) {
                setIsEditing(false);
            }
            return;
        }
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditText(todo.text);
        setIsEditing(false);
    };

    return (
        <>
            <ListItem disablePadding sx={{ py: 0.5 }}>
                <Checkbox
                    checked={todo.completed}
                    onChange={() => intent.toggleTodo(todo.id)}
                    sx={{ color: 'primary.light' }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {isEditing ? (
                        <TextField
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            size="small"
                            fullWidth
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') handleCancel(); }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    ) : (
                        <Typography
                            variant="body1"
                            sx={{
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? 'text.disabled' : 'text.primary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                transition: 'color 0.2s',
                            }}
                        >
                            {todo.text}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', ml: 1 }}>
                    {isEditing ? (
                        <>
                            <IconButton size="small" color="primary" onClick={handleEdit}>
                                <CheckRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={handleCancel}>
                                <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                        </>
                    ) : (
                        <>
                            <IconButton size="small" onClick={handleEdit} sx={{ color: 'text.secondary' }}>
                                <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => intent.deleteTodo(todo.id)}>
                                <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                        </>
                    )}
                </Box>
            </ListItem>
            <Divider component="li" sx={{ mx: 1 }} />
        </>
    );
}
