import { useSelector } from 'react-redux';
import { useIntent } from '../model/appSlice';
import TodoItem from './TodoItem';
import type { RootState } from '../store/store';
import { Filter } from '../model/Filter';
import { useSuspenseTodosQuery } from '../api/useSuspenseTodosQuery';
import {
    Box, Typography, Checkbox, Button, Divider,
    LinearProgress, Alert, List,
} from '@mui/material';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

export default function TodoList() {
    const { todos, isFetching, isError } = useSuspenseTodosQuery();
    const filter = useSelector((state: RootState) => state.app.filter);
    const intent = useIntent();

    const isAllCompleted = todos.length > 0 && todos.every(todo => todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);

    const filteredTodos = todos.filter(todo => {
        switch (filter) {
            case Filter.ACTIVE:    return !todo.completed;
            case Filter.COMPLETED: return todo.completed;
            default:               return true;
        }
    });

    return (
        <Box>
            {isFetching && (
                <LinearProgress sx={{ borderRadius: 1, mb: 1 }} />
            )}
            {isError && (
                <Alert severity="warning" sx={{ mb: 1, borderRadius: 2 }}>
                    갱신에 실패했습니다. 잠시 후 다시 시도됩니다.
                </Alert>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Checkbox
                    checked={isAllCompleted}
                    onChange={(e) => intent.toggleTodoAll(todos, e.target.checked)}
                    disabled={todos.length === 0}
                    sx={{ color: 'primary.main' }}
                />
                <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ flex: 1 }}>
                    할일 ({todos.length})
                </Typography>
                <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteSweepRoundedIcon />}
                    onClick={() => intent.deleteCompletedTodos(completedTodos.map(t => t.id))}
                    disabled={completedTodos.length === 0}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    {completedTodos.length > 0 ? `${completedTodos.length}개 ` : ''}삭제
                </Button>
            </Box>

            <Divider />

            <List disablePadding>
                {filteredTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
                {filteredTodos.length === 0 && (
                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.disabled' }}>
                        <Typography variant="body2">할 일이 없습니다</Typography>
                    </Box>
                )}
            </List>
        </Box>
    );
}
