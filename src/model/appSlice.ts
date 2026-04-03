import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { Filter } from './Filter';
import type { Todo } from './Todo';

// ─── Model ────────────────────────────────────────────────────────────────────
// 앱 전체의 상태를 하나의 불변 객체로 표현합니다.
// 모든 UI 는 이 State 를 읽어 렌더링되며, State 는 오직 Redux store 를 통해서만 변경됩니다.
export interface AppState {
    todos: Todo[];
    filter: Filter;
}

export const initialState: AppState = {
    todos: [
        { id: 1, text: '할일 1', completed: false },
        { id: 2, text: '할일 2', completed: true },
        { id: 3, text: '할일 3', completed: false },
    ],
    filter: Filter.ALL,
};

// ─── Reducer + Intent 정의 ────────────────────────────────────────────────────
// createSlice 로 Action creator(Intent)와 Reducer 를 함께 정의합니다.
// RTK 내부에서 Immer 를 사용하므로 불변성을 직접 신경 쓰지 않아도 됩니다.
const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        addTodo(state, action: PayloadAction<string>) {
            const nextId = state.todos.length > 0
                ? state.todos[state.todos.length - 1].id + 1
                : 1;
            state.todos.push({ id: nextId, text: action.payload, completed: false });
        },

        deleteTodo(state, action: PayloadAction<number>) {
            state.todos = state.todos.filter(t => t.id !== action.payload);
        },

        toggleTodo(state, action: PayloadAction<number>) {
            const todo = state.todos.find(t => t.id === action.payload);
            if (todo) todo.completed = !todo.completed;
        },

        editTodo(state, action: PayloadAction<{ id: number; newText: string }>) {
            const todo = state.todos.find(t => t.id === action.payload.id);
            if (todo) todo.text = action.payload.newText;
        },

        toggleAll(state, action: PayloadAction<boolean>) {
            state.todos.forEach(t => { t.completed = action.payload; });
        },

        deleteCompleted(state) {
            state.todos = state.todos.filter(t => !t.completed);
        },

        changeFilter(state, action: PayloadAction<Filter>) {
            state.filter = action.payload;
        },
    },
});

export const appActions = appSlice.actions;
export default appSlice.reducer;

// ─── Intent ───────────────────────────────────────────────────────────────────
// DOM 이벤트를 Action 으로 변환하는 Intent 훅입니다.
// View 에서 발생한 이벤트는 이 훅을 통해 Redux store 로 dispatch 됩니다.
export function useIntent() {
    const dispatch = useDispatch();
    return {
        addTodo:            (text: string)                  => dispatch(appActions.addTodo(text)),
        deleteTodo:         (id: number)                    => dispatch(appActions.deleteTodo(id)),
        toggleTodo:         (id: number)                    => dispatch(appActions.toggleTodo(id)),
        editTodo:           (id: number, newText: string)   => dispatch(appActions.editTodo({ id, newText })),
        toggleTodoAll:      (completed: boolean)            => dispatch(appActions.toggleAll(completed)),
        deleteTodoCompleted:()                              => dispatch(appActions.deleteCompleted()),
        changeFilter:       (filter: Filter)                => dispatch(appActions.changeFilter(filter)),
    };
}
