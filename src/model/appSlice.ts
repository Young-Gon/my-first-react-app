import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/store';
import { addTodo, deleteTodo, deleteCompletedTodos, editTodo, fetchTodos, toggleTodo, toggleTodoAll } from '../api/fetchTodos';
export { fetchTodos };
import { Filter } from './Filter';
import type { Todo } from './Todo';

// ─── Model ────────────────────────────────────────────────────────────────────
// 앱 전체의 상태를 하나의 불변 객체로 표현합니다.
// 모든 UI 는 이 State 를 읽어 렌더링되며, State 는 오직 Redux store 를 통해서만 변경됩니다.
export interface AppState {
    todos: Todo[];
    filter: Filter;
    loading: boolean;
    error: string | null;
}

export const initialState: AppState = {
    todos: [],
    loading: false,
    error: null,
    filter: Filter.ALL,
};

// ─── Reducer + Intent 정의 ────────────────────────────────────────────────────
// createSlice 로 Action creator(Intent)와 Reducer 를 함께 정의합니다.
// RTK 내부에서 Immer 를 사용하므로 불변성을 직접 신경 쓰지 않아도 됩니다.
const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        changeFilter(state, action: PayloadAction<Filter>) {
            state.filter = action.payload;
        },
    },
    extraReducers: (builder) => {
        // 비동기 액션 핸들링 예시 (예: API 호출)
        builder.addCase(fetchTodos.pending, (state) => {
            state.loading = true;
        }).addCase(fetchTodos.fulfilled, (state, action) => {
            state.loading = false;
            state.todos = action.payload;
        }).addCase(fetchTodos.rejected, (state, action) => {
            state.loading = false;
            // rejectWithValue를 사용했다면 action.payload에, 
            // 일반적인 예외라면 action.error.message에 에러 내용이 담깁니다.
            state.error = /* action.payload || */ action.error.message || 'Failed to fetch todos';
        }).addCase(addTodo.pending, (state) => {
            state.loading = true;
        }).addCase(addTodo.fulfilled, (state, action) => {
            state.loading = false;
            state.todos.push(action.payload);
        }).addCase(addTodo.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to add todo';
        }).addCase(deleteTodo.pending, (state) => {
            state.loading = true;
        }).addCase(deleteTodo.fulfilled, (state, action) => {
            state.loading = false;
            state.todos = state.todos.filter(t => t.id !== action.payload);
        }).addCase(deleteTodo.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to delete todo';
        }).addCase(editTodo.pending, (state) => {
            state.loading = true;
        }).addCase(editTodo.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.todos.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.todos[index] = action.payload;
            }
        }).addCase(editTodo.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to edit todo';
        }).addCase(toggleTodo.pending, (state) => {
            state.loading = true;
        }).addCase(toggleTodo.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.todos.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.todos[index] = action.payload;
            }
        }).addCase(toggleTodo.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to toggle todo';
        }).addCase(toggleTodoAll.pending, (state) => {
            state.loading = true;
        }).addCase(toggleTodoAll.fulfilled, (state, action) => {
            state.loading = false;
            action.payload.forEach(updated => {
                const index = state.todos.findIndex(t => t.id === updated.id);
                if (index !== -1) state.todos[index] = updated;
            });
        }).addCase(toggleTodoAll.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to toggle all todos';
        }).addCase(deleteCompletedTodos.pending, (state) => {
            state.loading = true;
        }).addCase(deleteCompletedTodos.fulfilled, (state, action) => {
            state.loading = false;
            state.todos = state.todos.filter(t => !action.payload.includes(t.id));
        }).addCase(deleteCompletedTodos.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to delete completed todos';
        })
    }
});

export const appActions = appSlice.actions;
export default appSlice.reducer;

// ─── Intent ───────────────────────────────────────────────────────────────────
// DOM 이벤트를 Action 으로 변환하는 Intent 훅입니다.
// View 에서 발생한 이벤트는 이 훅을 통해 Redux store 로 dispatch 됩니다.
export function useIntent() {
    const dispatch = useDispatch<AppDispatch>();
    return {
        toggleTodoAll:      (completed: boolean)            => dispatch(toggleTodoAll(completed)),
        deleteTodoCompleted:()                              => dispatch(deleteCompletedTodos()),
        changeFilter:       (filter: Filter)                => dispatch(appActions.changeFilter(filter)),
        fetchTodos:         ()                              => dispatch(fetchTodos()),
        addTodoAsync:       (text: string)                  => dispatch(addTodo(text)),
        deleteTodoAsync:    (id: number)                    => dispatch(deleteTodo(id)),
        editTodoAsync:      (id: number, newText: string)   => dispatch(editTodo({ id, newText })),
        toggleTodoAsync:    (id: number)                    => dispatch(toggleTodo(id)),
    };
}
